"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import OpenAI from "openai";
import { assemblePrompt, PROMPT_VERSION } from "../../lib/prompts";
import { APP_VERSION } from "../../lib/constants";

// ── Main generation action — called from mobile app ──────────────────────
export const generatePattern = action({
  args: {
    type: v.string(),
    description: v.string(),
    difficulty: v.string(),
    colors: v.array(v.string()),
    size: v.string(),
    yarnWeight: v.optional(v.string()),
    specialFeatures: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const startTime = Date.now();

    // 1. AUTH — identity comes from ClerkProvider wired to Convex
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const clerkId = identity.subject;

    // 2. USER LOOKUP — get email and isPremium for logging
    const user = await ctx.runQuery(api.queries.getPatterns.getUserByClerkId, {
      clerkId,
    });
    const userEmail = (identity as any).email ?? user?.email ?? "";
    const isPremium = user?.isPremium ?? false;

    // 3. QUOTA CHECK — uncomment in Phase 2 Step 8
    // if (user && !user.isPremium && user.monthlyCount >= 3) {
    //   throw new Error('QUOTA_EXCEEDED');
    // }

    // 4. ASSEMBLE PROMPT
    const fullPrompt = assemblePrompt({
      type: args.type,
      description: args.description,
      difficulty: args.difficulty,
      colors: args.colors,
      size: args.size,
      yarnWeight: args.yarnWeight,
      specialFeatures: args.specialFeatures,
    });

    // 5. CREATE LOG ROW — safe default status = 'failed', overwritten on success
    const logId = await ctx.runMutation(
      internal.mutations.generationLogs.create,
      {
        userId: clerkId,
        userEmail,
        inputs: {
          type: args.type,
          description: args.description,
          difficulty: args.difficulty,
          colors: args.colors,
          size: args.size,
          yarnWeight: args.yarnWeight,
          specialFeatures: args.specialFeatures,
        },
        promptSent: {
          fullPrompt,
          promptVersion: PROMPT_VERSION,
          temperature: 0.3,
          model: "gpt-4o-mini",
        },
        isPremium,
        appVersion: APP_VERSION,
        createdAt: startTime,
      },
    );

    try {
      // 6. GENERATE TEXT via gpt-4o-mini — one auto-retry
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const textStart = Date.now();

      const callGPT = async () => {
        return await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0.3,
          max_tokens: 8000,
          messages: [{ role: "user", content: fullPrompt }],
        });
      };

      let openAiResponse;
      try {
        openAiResponse = await callGPT();
      } catch {
        await new Promise((r) => setTimeout(r, 2000));
        openAiResponse = await callGPT();
      }

      const textMs = Date.now() - textStart;
      const rawText = openAiResponse.choices[0].message.content ?? "";
      const tokensIn = openAiResponse.usage?.prompt_tokens ?? 0;
      const tokensOut = openAiResponse.usage?.completion_tokens ?? 0;
      // gpt-4o-mini pricing: $0.15/1M input tokens, $0.60/1M output tokens
      const textCostUsd = tokensIn * 0.00000015 + tokensOut * 0.0000006;

      // 7. PARSE IMAGE DESCRIPTION written by GPT, then strip it from stored pattern text
      const imageDescMatch = rawText.match(/^IMAGE DESCRIPTION:\s*(.+)/m);
      const colorStr =
        args.colors.length > 0 ? args.colors.join(" and ") : "natural";
      const yarnStr = args.yarnWeight ?? "worsted";
      const fallbackDescription =
        `A photorealistic studio photo of a finished ${args.type} made with ${colorStr} ${yarnStr} yarn, ` +
        `on a warm wooden surface, soft studio lighting, sharp yarn texture, no people, no text`;
      const imageDescription = imageDescMatch
        ? imageDescMatch[1].trim()
        : fallbackDescription;
      let patternText = rawText
        .replace(/^IMAGE DESCRIPTION:.*$/m, "")
        .trimEnd();

      // 8. VALIDATE — continue best-effort
      const validation = validatePatternText(patternText);
      if (!validation.passed) {
        console.warn(
          "Validation issues (continuing best-effort):",
          validation.reasons,
        );
      }
      const parsedSections = (patternText.match(/^--- .+ ---$/gm) ?? []).filter(
        (l) => !l.includes("BEGIN PATTERN") && !l.includes("END PATTERN"),
      ).length;

      // 9. PARSE PATTERN NAME & SECTION NAMES
      const patternName = extractPatternName(patternText);
      const sectionNames = extractSectionNames(patternText);
      console.log("Pattern:", patternName, "| Sections:", sectionNames);

      // 10. UPDATE LOG after text generation
      await ctx.runMutation(internal.mutations.generationLogs.updateAfterText, {
        logId,
        rawTextResponse: rawText,
        parsedSections,
        validationPassed: validation.passed,
        validationErrors:
          validation.reasons.length > 0 ? validation.reasons : undefined,
        textGenerationMs: textMs,
        textTokensIn: tokensIn,
        textTokensOut: tokensOut,
        textCostUsd,
      });

      // 11. GENERATE IMAGE via dall-e-3 using GPT's own description
      const imageStart = Date.now();
      const sectionImages: Record<string, string> = {};
      let imageStorageId = "";
      let imageUrl = "";
      let imageError = "";

      try {
        const img = await openai.images.generate({
          model: "dall-e-3",
          prompt: imageDescription,
          n: 1,
          size: "1024x1024",
          response_format: "b64_json",
        });
        const b64 = img.data?.[0]?.b64_json;
        if (b64) {
          const bytes = Buffer.from(b64, "base64");
          const storageId = await ctx.storage.store(
            new Blob([bytes], { type: "image/png" }),
          );
          const url = await ctx.storage.getUrl(storageId);
          if (url) {
            sectionImages["HERO"] = url;
            imageStorageId = storageId;
            imageUrl = url;
          }
        }
      } catch (err: any) {
        console.error("Hero image generation failed:", err);
        imageError = err?.message ?? "Unknown error";
      }

      const imageMs = Date.now() - imageStart;
      const imagesSucceeded = imageUrl ? 1 : 0;
      const imageCostUsd = imagesSucceeded * 0.04;
      const totalCostUsd = textCostUsd + imageCostUsd;
      const totalMs = Date.now() - startTime;
      const status = imagesSucceeded === 1 ? "success" : "partial";

      // 12. SAVE PATTERN
      const patternId = (await ctx.runMutation(
        api.mutations.savePattern.savePattern,
        {
          clerkId,
          patternText,
          sectionImages,
          logId: logId as string,
          metadata: {
            type: args.type,
            difficulty: args.difficulty,
            colors: args.colors,
            size: args.size,
            yarnWeight: args.yarnWeight ?? "worsted",
            specialFeatures: args.specialFeatures ?? [],
            promptVersion: PROMPT_VERSION,
            modelUsed: "gpt-4o-mini + dall-e-3",
            temperature: 0.3,
          },
        },
      )) as string;

      // 13. FINALISE LOG
      await ctx.runMutation(internal.mutations.generationLogs.finalise, {
        logId,
        patternId: patternId as string,
        imagePrompts: [imageDescription],
        imageStorageIds: imageStorageId ? [imageStorageId] : [],
        imageUrls: imageUrl ? [imageUrl] : [],
        imageErrors: imageError ? [imageError] : undefined,
        imagesRequested: 1,
        imagesSucceeded,
        imageGenerationMs: imageMs,
        totalGenerationMs: totalMs,
        imageCostUsd,
        totalCostUsd,
        status: status as "success" | "partial",
      });

      // 14. INCREMENT USAGE — uncomment in Phase 2 Step 8
      // await ctx.runMutation(api.mutations.incrementUsage.incrementUsage, { userId });

      return { patternId, patternText, sectionImages };
    } catch (error: any) {
      await ctx.runMutation(internal.mutations.generationLogs.markFailed, {
        logId,
        errorMessage: error?.message,
        totalGenerationMs: Date.now() - startTime,
      });
      throw error;
    }
  },
});

// ── Extract pattern name from GPT response ───────────────────────────
function extractPatternName(text: string): string {
  const match = text.match(/PATTERN NAME:\s*(.+)/);
  return match ? match[1].trim() : "Crochet Pattern";
}

// ── Extract section names from GPT response ─────────────────────────
function extractSectionNames(text: string): string[] {
  const re = /^---\s*([A-Z][A-Z\s&]+?)\s*---$/gm;
  const names: string[] = [];
  let match;
  while ((match = re.exec(text)) !== null) {
    const name = match[1].trim();
    // Skip the pattern-level delimiters
    if (name !== "BEGIN PATTERN" && name !== "END PATTERN") {
      names.push(name);
    }
  }
  return names;
}

// ── Validation ────────────────────────────────────────────────────────────
export function validatePatternText(text: string): {
  passed: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];

  const required = [
    "PATTERN NAME:",
    "MATERIALS:",
    "GAUGE:",
    "FINISHED SIZE:",
    "ABBREVIATIONS:",
    "NOTES:",
    "SECTIONS:",
    "---END PATTERN---",
  ];
  for (const s of required) {
    if (!text.includes(s)) reasons.push("Missing: " + s);
  }

  const roundLines = (text.match(/^(Rnd|Row) \d+:/gm) ?? []).length;
  const countedLines = (text.match(/-- \d+ sts/g) ?? []).length;
  if (roundLines > 0 && countedLines / roundLines < 0.8) {
    reasons.push("Over 20% of rounds missing stitch count declarations");
  }

  if (text.split(" ").length < 400) {
    reasons.push("Response too short, likely truncated");
  }

  return { passed: reasons.length === 0, reasons };
}
