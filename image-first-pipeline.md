# Plan: Image-First Generation Pipeline

**Status:** Pending — implement after v10 prompt validation  
**Date:** March 2, 2026  
**Depends on:** v10 prompt changes (rule #9, #10, amigurumi shaping, grid image)

---

## Overview

Generate an image of the finished piece FIRST, then feed that image back to GPT-4o (vision) so the pattern is written to match a concrete visual reference. Eliminates pattern-image mismatch entirely.

## Flow

```
User submits form
  → 1. DALL-E 3 generates grid image (parts + assembled)
  → 2. GPT-4o (vision) receives image + system prompt → writes pattern
  → 3. Pattern + image returned to user (same image, no second DALL-E call)
```

## Technical Details

### Step 1: Image Generation

- Model: `dall-e-3`
- Size: `1024x1024`
- Prompt: Grid layout — individual parts in top rows, assembled piece bottom-right
- Response format: `b64_json` (store in Convex, get URL)
- Cost: $0.04
- Time: ~8-12s

### Step 2: Pattern from Image

- Model: `gpt-4o` (required for vision — gpt-4o-mini does NOT support image inputs)
- Temperature: `0.3`
- max_tokens: `4500`
- Messages:
  ```
  system: buildSystemPrompt() + buildOutputTemplate()
  user: [
    { type: "image_url", image_url: { url: <convex storage URL> } },
    { type: "text", text: buildUserContext(args) }  // no buildImageInstruction needed
  ]
  ```
- Cost: ~$0.01-0.03 (image token cost depends on resolution)
- Time: ~10-15s

### Step 3: Return

- Same image from Step 1 used as hero — no IMAGE DESCRIPTION parsing needed
- Pattern text stored as-is
- Total cost: ~$0.08-0.12 per generation (vs ~$0.05 currently)
- Total time: ~25-30s (vs ~15-20s currently)

## Changes Required

### `lib/prompts.ts`

- Remove `buildImageInstruction()` — no longer needed
- Remove IMAGE DESCRIPTION line from the user prompt
- `assemblePrompt()` returns `{ system, user, imageUrl? }` — when imageUrl is present, the caller builds multimodal messages

### `convex/actions/generatePattern.ts`

- Reorder: DALL-E call moves BEFORE GPT call
- Build multimodal `messages` array with image_url content part
- Switch model from `gpt-4o-mini` to `gpt-4o` (only when using image input)
- Remove IMAGE DESCRIPTION parsing/regex
- Remove fallback description logic
- Keep continuation retry (still relevant — pattern can still truncate)

### `app/(tabs)/create.tsx` — Loading Steps (image-first version)

```tsx
const LOADING_STEPS = [
  { id: 0, label: "Reading your description...", emoji: "📖" },
  { id: 1, label: "Generating your design image...", emoji: "🎨" },
  { id: 2, label: "Designing stitch counts & shaping...", emoji: "🧮" },
  { id: 3, label: "Writing pattern sections...", emoji: "✍️" },
  { id: 4, label: "Checking for completeness...", emoji: "✅" },
  { id: 5, label: "Finalising your blueprint...", emoji: "📦" },
];

// Intervals matched to real pipeline timing (~30s total)
const intervals = [1500, 8000, 14000, 20000, 26000];
```

Reassurance text below steps:

```tsx
<Text style={reassuranceStyle}>
  This usually takes 20–30 seconds.{"\n"}Your pattern is being carefully
  crafted!
</Text>
```

### Logging (`convex/mutations/generationLogs.ts`)

- Add `imageGeneratedFirst: v.boolean()` to log schema
- Log image generation timing separately from pattern generation timing

## Cost Comparison

| Item      | Current (v10)   | Image-First         |
| --------- | --------------- | ------------------- |
| GPT text  | $0.01 (4o-mini) | $0.03 (4o + vision) |
| DALL-E 3  | $0.04           | $0.04               |
| **Total** | **~$0.05**      | **~$0.07-0.10**     |

## Tradeoffs

| Aspect              | Current        | Image-First            |
| ------------------- | -------------- | ---------------------- |
| Pattern-image match | Often wrong    | Guaranteed             |
| Pattern accuracy    | Model imagines | Model sees proportions |
| Cost                | ~$0.05         | ~$0.10                 |
| Latency             | ~15-20s        | ~25-30s                |
| Model required      | gpt-4o-mini    | gpt-4o (vision)        |

## Current Loading Steps (v10 — pre-image-first)

These are the loading step updates to apply NOW (before the image-first pipeline):

```tsx
const LOADING_STEPS = [
  { id: 0, label: "Reading your description...", emoji: "📖" },
  { id: 1, label: "Designing stitch counts & shaping...", emoji: "🧮" },
  { id: 2, label: "Writing pattern sections...", emoji: "✍️" },
  { id: 3, label: "Checking for completeness...", emoji: "✅" },
  { id: 4, label: "Generating your image...", emoji: "🎨" },
  { id: 5, label: "Finalising your blueprint...", emoji: "📦" },
];

// Intervals matched to v10 pipeline timing (~25s total)
const intervals = [1500, 5000, 12000, 18000, 24000];
```

Reassurance text (add after step list in loading UI):

```tsx
<Text
  style={{
    color: Colors.gray,
    fontFamily: Font.body,
    fontSize: FontSize.sm,
    textAlign: "center",
    marginTop: Spacing[4],
    paddingHorizontal: Spacing[6],
  }}
>
  This usually takes 20–30 seconds.{"\n"}Your pattern is being carefully
  crafted!
</Text>
```

## Decision Log

- Chose gpt-4o over gpt-4o-mini for vision — mini doesn't support image inputs
- Grid image serves dual purpose: user-facing hero + pattern reference input
- Continuation retry kept — truncation can still happen regardless of image input
- Image-first adds ~10s latency — acceptable given quality improvement
