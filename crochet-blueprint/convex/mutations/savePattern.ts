import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const savePattern = mutation({
  args: {
    clerkId: v.string(), // resolved to userId inside
    patternText: v.string(),
    sectionImages: v.record(v.string(), v.string()),
    logId: v.optional(v.string()), // generationLogs _id
    metadata: v.object({
      type: v.string(),
      difficulty: v.string(),
      colors: v.array(v.string()),
      size: v.string(),
      yarnWeight: v.string(),
      specialFeatures: v.array(v.string()),
      promptVersion: v.string(),
      modelUsed: v.string(),
      temperature: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Look up or create user
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) {
      const newId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: "",
        isPremium: false,
        monthlyCount: 0,
        monthlyResetAt: startOfNextMonth(),
        createdAt: Date.now(),
      });
      user = await ctx.db.get(newId);
    }

    return await ctx.db.insert("patterns", {
      userId: user!._id,
      patternText: args.patternText,
      sectionImages: args.sectionImages,
      metadata: args.metadata,
      logId: args.logId,
      isSaved: false,
      createdAt: Date.now(),
    });
  },
});

export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      isPremium: false,
      monthlyCount: 0,
      monthlyResetAt: startOfNextMonth(),
      createdAt: Date.now(),
    });
  },
});

export const toggleSaved = mutation({
  args: { patternId: v.id("patterns") },
  handler: async (ctx, args) => {
    const pattern = await ctx.db.get(args.patternId);
    if (!pattern) throw new Error("Pattern not found");
    await ctx.db.patch(args.patternId, { isSaved: !pattern.isSaved });
  },
});

export const ratePattern = mutation({
  args: {
    patternId: v.id("patterns"),
    rating: v.number(), // 1 = thumbs up, -1 = thumbs down
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.patternId, { rating: args.rating });

    // Mirror rating back into the generation log for admin visibility
    const pattern = await ctx.db.get(args.patternId);
    if (pattern?.logId) {
      const logId = pattern.logId as any; // stored as string, cast for db.patch
      const log = await ctx.db.get(logId);
      if (log) {
        await ctx.db.patch(logId, {
          userRating: args.rating === 1 ? "up" : "down",
        });
      }
    }
  },
});

// ── Phase 2: increment monthly usage counter ─────────────────────────────
export const incrementUsage = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return;

    const now = Date.now();
    // Reset counter if past reset date
    if (now >= user.monthlyResetAt) {
      await ctx.db.patch(args.userId, {
        monthlyCount: 1,
        monthlyResetAt: startOfNextMonth(),
      });
    } else {
      await ctx.db.patch(args.userId, {
        monthlyCount: user.monthlyCount + 1,
      });
    }
  },
});

function startOfNextMonth(): number {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
