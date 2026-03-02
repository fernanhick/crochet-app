# Crochet Blueprint — Generation Logging & Admin Dashboard Spec

**Version 1.0 | March 2026**  
**Companion to:** CrochetApp_Blueprint_v6.docx  
**Purpose:** Complete audit trail for every pattern generation + admin dashboard to review all results including images

---

## 1. What Gets Logged

Every single generation event is stored in full. Nothing is discarded. This gives you:

- A complete audit trail for debugging bad outputs
- Cost tracking per user, per day, per pattern type
- Raw material for prompt A/B testing
- The ability to review any pattern — text + images — at any time
- Data to identify your best and worst performing prompts

---

## 2. Convex Schema

### 2.1 New table — `generationLogs`

This is a separate table from `patterns`. The `patterns` table is what users see. The `generationLogs` table is what you see. Every generation creates one row in each.

```typescript
// convex/schema.ts

generationLogs: defineTable({

  // ── Linkage ──────────────────────────────────────────
  patternId: v.string(),              // matches patterns table patternId
  userId: v.string(),                 // Clerk user ID
  userEmail: v.string(),              // denormalised for easy admin lookup

  // ── User inputs (exactly what the user submitted) ────
  inputs: v.object({
    crochetType: v.string(),          // e.g. "Amigurumi"
    difficulty: v.string(),           // e.g. "Beginner"
    colors: v.array(v.string()),      // e.g. ["#FFD93D", "#F5F0E0"]
    size: v.string(),                 // e.g. "Medium"
    creativeBrief: v.string(),        // raw text from the textarea
    yarnWeight: v.optional(v.string()),
    specialFeatures: v.optional(v.array(v.string())),
  }),

  // ── Prompt sent to OpenAI (full assembled prompt) ────
  promptSent: v.object({
    systemPrompt: v.string(),         // the system prompt as sent
    userMessage: v.string(),          // the user context block as sent
    promptVersion: v.string(),        // e.g. "v2.3" — bump when you edit prompts
    temperature: v.number(),          // e.g. 0.3
    model: v.string(),                // e.g. "gpt-4o-mini"
  }),

  // ── Raw AI response (before any parsing or validation) ──
  rawTextResponse: v.string(),        // unmodified string from OpenAI
  parsedSections: v.number(),         // how many sections were parsed out
  validationPassed: v.boolean(),      // did validatePatternText() pass?
  validationErrors: v.optional(v.array(v.string())), // if it failed, why

  // ── Images ───────────────────────────────────────────
  imagePrompts: v.array(v.string()),  // DALL-E prompt sent for each section
  imageStorageIds: v.array(v.string()), // Convex Storage IDs for each image
  imageUrls: v.array(v.string()),     // public URLs (for admin dashboard display)
  imagesRequested: v.number(),        // how many were attempted
  imagesSucceeded: v.number(),        // how many came back without error
  imageErrors: v.optional(v.array(v.string())), // any DALL-E errors per image

  // ── Performance & cost ───────────────────────────────
  textGenerationMs: v.number(),       // time for OpenAI text call
  imageGenerationMs: v.number(),      // time for all DALL-E calls (parallel)
  totalGenerationMs: v.number(),      // wall-clock total
  textTokensIn: v.number(),           // prompt tokens sent to OpenAI
  textTokensOut: v.number(),          // completion tokens received
  textCostUsd: v.number(),            // calculated from token counts
  imageCostUsd: v.number(),           // DALL-E cost (imagesSucceeded × $0.04)
  totalCostUsd: v.number(),           // textCostUsd + imageCostUsd

  // ── Outcome ──────────────────────────────────────────
  status: v.union(
    v.literal('success'),
    v.literal('partial'),             // text ok, some images failed
    v.literal('failed'),              // validation failed or OpenAI error
  ),
  errorMessage: v.optional(v.string()), // top-level error if status = failed
  userRating: v.optional(v.union(
    v.literal('up'),
    v.literal('down'),
  )),                                 // filled in later when user rates

  // ── Metadata ─────────────────────────────────────────
  isPremium: v.boolean(),             // was this a premium generation?
  appVersion: v.string(),             // e.g. "1.0.2"
  createdAt: v.number(),              // Unix timestamp ms

}).index('by_userId', ['userId'])
  .index('by_patternId', ['patternId'])
  .index('by_status', ['status'])
  .index('by_createdAt', ['createdAt']),
```

### 2.2 Update existing `patterns` table

Add one field to link back to the log:

```typescript
patterns: defineTable({
  // ... existing fields
  logId: v.string(),   // generationLogs _id for this pattern
})
```

---

## 3. Convex Action Changes

### 3.1 Where to add logging in `generatePattern`

The logging wraps the entire action. Create the log row at the start with `status: 'failed'` as a safe default, then update it at each stage.

```typescript
// convex/actions/generatePattern.ts

export const generatePattern = action({
  args: { /* existing args */ },

  handler: async (ctx, args) => {
    const startTime = Date.now();
    const patternId = nanoid(10);

    // ── 1. Create log row immediately (safe default = failed) ──
    const logId = await ctx.runMutation(internal.generationLogs.create, {
      patternId,
      userId: args.userId,
      userEmail: args.userEmail,
      inputs: {
        crochetType: args.crochetType,
        difficulty: args.difficulty,
        colors: args.colors,
        size: args.size,
        creativeBrief: args.creativeBrief,
        yarnWeight: args.yarnWeight,
        specialFeatures: args.specialFeatures,
      },
      promptSent: {
        systemPrompt: SYSTEM_PROMPT,          // your full system prompt constant
        userMessage: buildUserMessage(args),  // assembled user context block
        promptVersion: PROMPT_VERSION,        // e.g. "v1.0"
        temperature: 0.3,
        model: 'gpt-4o-mini',
      },
      status: 'failed',  // default — overwritten on success
      isPremium: args.isPremium,
      appVersion: APP_VERSION,
      createdAt: startTime,
    });

    try {

      // ── 2. Call OpenAI for text ──────────────────────
      const textStart = Date.now();
      const openAiResponse = await openai.chat.completions.create({ /* ... */ });
      const textMs = Date.now() - textStart;

      const rawText = openAiResponse.choices[0].message.content ?? '';
      const tokensIn  = openAiResponse.usage?.prompt_tokens ?? 0;
      const tokensOut = openAiResponse.usage?.completion_tokens ?? 0;
      const textCost  = calculateTextCost(tokensIn, tokensOut);

      // ── 3. Validate and parse ────────────────────────
      const { valid, errors, sections } = validatePatternText(rawText);

      await ctx.runMutation(internal.generationLogs.updateAfterText, {
        logId,
        rawTextResponse: rawText,
        parsedSections: sections.length,
        validationPassed: valid,
        validationErrors: errors,
        textGenerationMs: textMs,
        textTokensIn: tokensIn,
        textTokensOut: tokensOut,
        textCostUsd: textCost,
      });

      if (!valid) throw new Error(`Validation failed: ${errors.join(', ')}`);

      // ── 4. Generate images in parallel ──────────────
      const imageStart = Date.now();
      const imagePrompts = sections.map(s => buildImagePrompt(s, args));
      const imageResults = await Promise.allSettled(
        imagePrompts.map(prompt => generateAndStoreImage(ctx, prompt))
      );
      const imageMs = Date.now() - imageStart;

      const imageStorageIds: string[] = [];
      const imageUrls: string[] = [];
      const imageErrors: string[] = [];
      imageResults.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          imageStorageIds.push(result.value.storageId);
          imageUrls.push(result.value.url);
          imageErrors.push('');
        } else {
          imageStorageIds.push('');
          imageUrls.push('');
          imageErrors.push(result.reason?.message ?? 'Unknown error');
        }
      });

      const imagesSucceeded = imageResults.filter(r => r.status === 'fulfilled').length;
      const imageCost = imagesSucceeded * 0.04;

      // ── 5. Finalise log row ──────────────────────────
      const totalMs = Date.now() - startTime;
      const status = imagesSucceeded === imagePrompts.length ? 'success' : 'partial';

      await ctx.runMutation(internal.generationLogs.finalise, {
        logId,
        imagePrompts,
        imageStorageIds,
        imageUrls,
        imagesRequested: imagePrompts.length,
        imagesSucceeded,
        imageErrors,
        imageGenerationMs: imageMs,
        totalGenerationMs: totalMs,
        imageCostUsd: imageCost,
        totalCostUsd: textCost + imageCost,
        status,
      });

      // ── 6. Store pattern (existing logic) ────────────
      // ... watermark, store to patterns table, etc.

    } catch (error: any) {
      // Update log with error
      await ctx.runMutation(internal.generationLogs.markFailed, {
        logId,
        errorMessage: error.message,
        totalGenerationMs: Date.now() - startTime,
      });
      throw error;
    }
  }
});
```

---

## 4. Admin Dashboard

### 4.1 What it is

A separate web app (not part of the React Native app) that you access from your browser. Built with Next.js or plain React. Protected by a simple password or your Clerk admin account. Connects directly to your Convex backend.

### 4.2 Views

**View 1 — Generation Feed (default)**

A reverse-chronological feed of every generation. Each row shows:

```
[timestamp]  [user email]  [type]  [difficulty]  [brief excerpt]  [status badge]  [cost]  [rating]
2026-03-01   maya@...      Amigurumi  Beginner   "a giraffe with..."  ✅ success  $0.31  👍
2026-03-01   sam@...       Hat        Easy       "slouchy winter..."  ⚠️ partial  $0.17  —
2026-02-28   maya@...      Scarf      Medium     "rainbow ombre..."   ❌ failed   $0.01  —
```

Click any row to open the Detail View.

**View 2 — Detail View (per generation)**

Shows everything for one generation log row:

```
┌─ INPUTS ──────────────────────────────────────────────┐
│ Type: Amigurumi  Difficulty: Beginner  Size: Medium   │
│ Colors: ■ #FFD93D  ■ #F5F0E0  ■ #C9A870             │
│ Brief: "a giraffe with a unicorn horn"                │
│ Yarn weight: Worsted  Special: Safety eyes            │
└───────────────────────────────────────────────────────┘

┌─ PROMPT SENT ─────────────────────────────────────────┐
│ Model: gpt-4o-mini  Temp: 0.3  Version: v1.0         │
│ [expandable: full system prompt]                      │
│ [expandable: full user message]                       │
└───────────────────────────────────────────────────────┘

┌─ RAW AI RESPONSE ─────────────────────────────────────┐
│ Sections parsed: 7  Validation: ✅ passed             │
│ [expandable: full raw response text]                  │
└───────────────────────────────────────────────────────┘

┌─ IMAGES ──────────────────────────────────────────────┐
│ [img: Head]  [img: Body]  [img: Legs]  [img: Ears]   │
│ [img: Horn]  [img: Assembly]  [img: Finished]         │
│ 7 / 7 succeeded                                       │
└───────────────────────────────────────────────────────┘

┌─ PATTERN OUTPUT ──────────────────────────────────────┐
│ [full watermarked pattern text, scrollable]           │
└───────────────────────────────────────────────────────┘

┌─ PERFORMANCE ─────────────────────────────────────────┐
│ Text: 3,241ms  Images: 18,432ms  Total: 21,673ms     │
│ Tokens in: 847  Tokens out: 2,103                    │
│ Text cost: $0.003  Image cost: $0.28  Total: $0.283  │
│ User rating: 👍  Status: ✅ success                   │
└───────────────────────────────────────────────────────┘
```

**View 3 — Stats Dashboard**

Aggregate numbers across all generations:

```
Total generations:     247
Success rate:          91.5%  (226/247)
Partial (img errors):   5.7%   (14/247)
Failed:                 2.8%    (7/247)

Total cost to date:    $62.14
Avg cost per run:      $0.252
Avg text cost:         $0.003
Avg image cost:        $0.249

Top types:    Amigurumi 44%  Hat 18%  Scarf 12%  Bag 9%  Other 17%
Top ratings:  👍 78%  👎 12%  No rating 10%

Daily cost chart: [sparkline]
Generation volume chart: [sparkline]
```

**View 4 — User Lookup**

Search by email. Shows all generations for that user, their account status (free/premium), total cost they've generated, any rating patterns.

### 4.3 Convex queries to add

```typescript
// convex/admin.ts — internal queries, not exposed to the app

// All logs, paginated, newest first
export const listGenerationLogs = internalQuery({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(v.string()),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('generationLogs').order('desc');
    if (args.status) query = query.filter(q => q.eq(q.field('status'), args.status));
    if (args.userId) query = query.withIndex('by_userId', q => q.eq('userId', args.userId));
    return await query.paginate(args.paginationOpts);
  }
});

// Single log with full detail
export const getGenerationLog = internalQuery({
  args: { logId: v.id('generationLogs') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.logId);
  }
});

// Aggregate stats
export const getStats = internalQuery({
  args: { sinceMs: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const since = args.sinceMs ?? 0;
    const logs = await ctx.db.query('generationLogs')
      .filter(q => q.gte(q.field('createdAt'), since))
      .collect();

    return {
      total: logs.length,
      succeeded: logs.filter(l => l.status === 'success').length,
      partial: logs.filter(l => l.status === 'partial').length,
      failed: logs.filter(l => l.status === 'failed').length,
      totalCostUsd: logs.reduce((sum, l) => sum + (l.totalCostUsd ?? 0), 0),
      avgCostUsd: logs.length
        ? logs.reduce((sum, l) => sum + (l.totalCostUsd ?? 0), 0) / logs.length
        : 0,
      ratedUp: logs.filter(l => l.userRating === 'up').length,
      ratedDown: logs.filter(l => l.userRating === 'down').length,
    };
  }
});
```

### 4.4 Admin dashboard tech stack

| Piece | Choice | Why |
|-------|--------|-----|
| Framework | Next.js (App Router) | Simple, deploys to Vercel in minutes |
| Convex client | `convex/react` | Same SDK as the main app |
| Auth | Clerk + admin role check | Reuse existing Clerk setup, add `role: 'admin'` metadata |
| Image display | Standard `<img>` tags using Convex Storage URLs | Images already stored in Convex |
| Hosting | Vercel (separate project from the main app) | Free tier is fine for admin use |

### 4.5 Protecting the admin dashboard

In the Next.js middleware, check that the logged-in Clerk user has `publicMetadata.role === 'admin'`. Set this in the Clerk dashboard on your own account. No one else can access it.

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();
    if (sessionClaims?.metadata?.role !== 'admin') {
      return Response.redirect(new URL('/sign-in', req.url));
    }
  }
});
```

---

## 5. Image Retention & Storage

All DALL-E images are stored in **Convex Storage** at generation time (this is already in the blueprint). The Storage IDs and public URLs are now also logged in `generationLogs.imageStorageIds` and `generationLogs.imageUrls`.

This means:
- Images are accessible from the admin dashboard immediately, forever
- If a user deletes a pattern from their library, the image still exists in Storage and in the log
- You can review any image from any generation at any time

**Storage cost estimate:**  
Each DALL-E 3 image (1024×1024) is ~1MB. At 100 generations/month × 7 images = 700MB/month added to Storage. Convex Storage costs $0.021/GB so that's about **$0.015/month** — negligible.

---

## 6. Build Priority

| Item | Phase | Effort |
|------|-------|--------|
| `generationLogs` schema + mutations | Phase 1 | 2 hours |
| Logging wired into `generatePattern` action | Phase 1 | 3 hours |
| Image URLs stored in log | Phase 1 | 30 min |
| Admin dashboard — feed + detail view | Phase 2 | 1 day |
| Admin dashboard — stats view | Phase 2 | 3 hours |
| Admin dashboard — user lookup | Phase 2 | 2 hours |
| User rating fed back into log | Phase 3 (Step 12) | 1 hour |

The schema and action logging (rows 1-3) should go in during Phase 1 alongside the core generation loop — it is much harder to backfill logs than to capture them from day one. The admin dashboard UI can wait until Phase 2 since the data will already be there.

---

*Crochet Blueprint — Internal Document*
