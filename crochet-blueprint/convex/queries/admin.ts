import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";

// ── Guard: require an authenticated user with role = 'admin' ─────────────────
async function requireAdmin(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthenticated");
  const role =
    (identity as any).publicMetadata?.role ??
    (identity as any).org_role ??
    null;
  if (role !== "admin") throw new Error("Forbidden");
  return identity;
}

// ── All logs, paginated, newest first ────────────────────────────────────────
export const listGenerationLogs = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Use userId index when filtering by user, otherwise use createdAt index
    let results;
    if (args.userId) {
      results = await ctx.db
        .query("generationLogs")
        .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      results = await ctx.db
        .query("generationLogs")
        .withIndex("by_createdAt")
        .order("desc")
        .paginate(args.paginationOpts);
    }

    // Post-query status filter
    if (args.status) {
      return {
        ...results,
        page: results.page.filter((l: any) => l.status === args.status),
      };
    }
    return results;
  },
});

// ── Single log — full detail ──────────────────────────────────────────────────
export const getGenerationLog = query({
  args: { logId: v.id("generationLogs") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get(args.logId);
  },
});

// ── Aggregate stats ───────────────────────────────────────────────────────────
export const getStats = query({
  args: { sinceMs: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const since = args.sinceMs ?? 0;
    const logs = await ctx.db
      .query("generationLogs")
      .withIndex("by_createdAt", (q: any) => q.gte("createdAt", since))
      .collect();

    const total = logs.length;
    const succeeded = logs.filter((l: any) => l.status === "success").length;
    const partial = logs.filter((l: any) => l.status === "partial").length;
    const failed = logs.filter((l: any) => l.status === "failed").length;
    const totalCostUsd = logs.reduce(
      (sum: number, l: any) => sum + (l.totalCostUsd ?? 0),
      0,
    );
    const ratedUp = logs.filter((l: any) => l.userRating === "up").length;
    const ratedDown = logs.filter((l: any) => l.userRating === "down").length;

    // Type distribution
    const typeCounts: Record<string, number> = {};
    for (const l of logs) {
      const t = l.inputs?.type ?? "unknown";
      typeCounts[t] = (typeCounts[t] ?? 0) + 1;
    }

    // Daily buckets (last 30 days) for sparkline
    const dailyCosts: { date: string; costUsd: number; count: number }[] = [];
    const buckets: Record<string, { costUsd: number; count: number }> = {};
    for (const l of logs) {
      const d = new Date(l.createdAt).toISOString().slice(0, 10);
      if (!buckets[d]) buckets[d] = { costUsd: 0, count: 0 };
      buckets[d].costUsd += l.totalCostUsd ?? 0;
      buckets[d].count += 1;
    }
    for (const [date, v] of Object.entries(buckets).sort()) {
      dailyCosts.push({ date, ...v });
    }

    return {
      total,
      succeeded,
      partial,
      failed,
      successRate: total ? succeeded / total : 0,
      totalCostUsd,
      avgCostUsd: total ? totalCostUsd / total : 0,
      ratedUp,
      ratedDown,
      typeCounts,
      dailyCosts,
    };
  },
});

// ── User lookup — all logs for one user email ─────────────────────────────────
export const getUserLogs = query({
  args: {
    email: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Find user id by scanning for matching email in generationLogs
    // (email is denormalised on each log row)
    const allForEmail = await ctx.db
      .query("generationLogs")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();

    const filtered = allForEmail.filter((l: any) =>
      l.userEmail?.toLowerCase().includes(args.email.toLowerCase()),
    );

    // Manual pagination
    const { numItems, cursor } = args.paginationOpts as any;
    const start = cursor ? parseInt(cursor, 10) : 0;
    const page = filtered.slice(start, start + numItems);
    const nextCursor =
      start + numItems < filtered.length ? String(start + numItems) : null;

    const totalCost = filtered.reduce(
      (s: number, l: any) => s + (l.totalCostUsd ?? 0),
      0,
    );
    const isPremium = filtered[0]?.isPremium ?? false;

    return {
      page,
      isDone: nextCursor === null,
      continueCursor: nextCursor ?? "",
      totalCost,
      isPremium,
    };
  },
});
