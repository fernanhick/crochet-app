import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

// ── Create log row immediately with safe default status = 'failed' ────────
export const create = internalMutation({
  args: {
    userId: v.string(),
    userEmail: v.string(),
    inputs: v.object({
      type: v.string(),
      description: v.string(),
      difficulty: v.string(),
      colors: v.array(v.string()),
      size: v.string(),
      yarnWeight: v.optional(v.string()),
      specialFeatures: v.optional(v.array(v.string())),
    }),
    promptSent: v.object({
      fullPrompt: v.string(),
      promptVersion: v.string(),
      temperature: v.number(),
      model: v.string(),
    }),
    isPremium: v.boolean(),
    appVersion: v.string(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("generationLogs", {
      ...args,
      rawTextResponse: "",
      parsedSections: 0,
      validationPassed: false,
      imagePrompts: [],
      imageStorageIds: [],
      imageUrls: [],
      imagesRequested: 0,
      imagesSucceeded: 0,
      textGenerationMs: 0,
      imageGenerationMs: 0,
      totalGenerationMs: 0,
      textTokensIn: 0,
      textTokensOut: 0,
      textCostUsd: 0,
      imageCostUsd: 0,
      totalCostUsd: 0,
      status: "failed",
    });
  },
});

// ── Patch after text generation completes ─────────────────────────────────
export const updateAfterText = internalMutation({
  args: {
    logId: v.id("generationLogs"),
    rawTextResponse: v.string(),
    parsedSections: v.number(),
    validationPassed: v.boolean(),
    validationErrors: v.optional(v.array(v.string())),
    textGenerationMs: v.number(),
    textTokensIn: v.number(),
    textTokensOut: v.number(),
    textCostUsd: v.number(),
  },
  handler: async (ctx, args) => {
    const { logId, ...patch } = args;
    await ctx.db.patch(logId, patch);
  },
});

// ── Patch with image results, pattern linkage, and final status ───────────
export const finalise = internalMutation({
  args: {
    logId: v.id("generationLogs"),
    patternId: v.string(),
    imagePrompts: v.array(v.string()),
    imageStorageIds: v.array(v.string()),
    imageUrls: v.array(v.string()),
    imageErrors: v.optional(v.array(v.string())),
    imagesRequested: v.number(),
    imagesSucceeded: v.number(),
    imageGenerationMs: v.number(),
    totalGenerationMs: v.number(),
    imageCostUsd: v.number(),
    totalCostUsd: v.number(),
    status: v.union(v.literal("success"), v.literal("partial")),
  },
  handler: async (ctx, args) => {
    const { logId, ...patch } = args;
    await ctx.db.patch(logId, patch);
  },
});

// ── Patch when a top-level error is caught ────────────────────────────────
export const markFailed = internalMutation({
  args: {
    logId: v.id("generationLogs"),
    errorMessage: v.optional(v.string()),
    totalGenerationMs: v.number(),
  },
  handler: async (ctx, args) => {
    const { logId, ...patch } = args;
    await ctx.db.patch(logId, { ...patch, status: "failed" });
  },
});
