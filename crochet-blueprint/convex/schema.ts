import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    isPremium: v.boolean(),
    monthlyCount: v.number(),
    monthlyResetAt: v.number(),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  patterns: defineTable({
    userId: v.id("users"),
    patternText: v.string(),
    sectionImages: v.record(v.string(), v.string()),
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
    logId: v.optional(v.string()), // generationLogs _id for this pattern
    rating: v.optional(v.number()),
    isSaved: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  generationLogs: defineTable({
    // ── Linkage ──────────────────────────────────────────────────────────
    patternId: v.optional(v.string()), // set during finalise, after pattern is saved
    userId: v.string(), // Clerk user ID
    userEmail: v.string(), // denormalised for admin lookup

    // ── User inputs ───────────────────────────────────────────────────────
    inputs: v.object({
      type: v.string(),
      description: v.string(),
      difficulty: v.string(),
      colors: v.array(v.string()),
      size: v.string(),
      yarnWeight: v.optional(v.string()),
      specialFeatures: v.optional(v.array(v.string())),
    }),

    // ── Prompt sent ───────────────────────────────────────────────────────
    promptSent: v.object({
      fullPrompt: v.string(), // full assembled prompt as sent
      promptVersion: v.string(), // e.g. "v9"
      temperature: v.number(),
      model: v.string(),
    }),

    // ── Raw AI response ───────────────────────────────────────────────────
    rawTextResponse: v.string(),
    parsedSections: v.number(),
    validationPassed: v.boolean(),
    validationErrors: v.optional(v.array(v.string())),

    // ── Images ────────────────────────────────────────────────────────────
    imagePrompts: v.array(v.string()),
    imageStorageIds: v.array(v.string()),
    imageUrls: v.array(v.string()),
    imagesRequested: v.number(),
    imagesSucceeded: v.number(),
    imageErrors: v.optional(v.array(v.string())),

    // ── Performance & cost ────────────────────────────────────────────────
    textGenerationMs: v.number(),
    imageGenerationMs: v.number(),
    totalGenerationMs: v.number(),
    textTokensIn: v.number(),
    textTokensOut: v.number(),
    textCostUsd: v.number(),
    imageCostUsd: v.number(),
    totalCostUsd: v.number(),

    // ── Outcome ───────────────────────────────────────────────────────────
    status: v.union(
      v.literal("success"),
      v.literal("partial"), // text ok, image failed
      v.literal("failed"), // validation failed or OpenAI error
    ),
    errorMessage: v.optional(v.string()),
    userRating: v.optional(v.union(v.literal("up"), v.literal("down"))),

    // ── Metadata ──────────────────────────────────────────────────────────
    imageGeneratedFirst: v.optional(v.boolean()), // v11: true = image-first pipeline
    isPremium: v.boolean(),
    appVersion: v.string(),
    createdAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_patternId", ["patternId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),
});
