/**
 * PROMPT VERSION 1  —  original
 *
 * Changes vs baseline:
 * - GPT template included IMAGE PROMPT line per section (let GPT write its own image description)
 * - Images generated with DALL-E 3, one per section, in parallel
 * - No colour enforcement — difficulty constraints suppressed colour changes
 *   (e.g. "easy" → "at most one colour change")
 * - sectionImages keyed by section name (e.g. "BODY", "HEAD")
 *
 * Retired because:
 * - Section images were visually inconsistent (different DALL-E seeds per call)
 * - GPT image prompts did not reliably match user-specified colours or description
 * - "Easy" difficulty was overriding explicit colour inputs from the user
 * - IMAGE PROMPT text leaked into rendered pattern body
 */

import type { UserContextArgs } from "../prompts";

export const VERSION = "v1";

export function buildSystemPrompt_v1(): string {
  return `You are an expert crochet pattern designer with 20+ years of professional experience creating patterns for all skill levels. You specialise in clear, mathematically accurate patterns with precise stitch counts and beginner-friendly instructions.

HARD RULES — you must follow every one:
1. Every round or row MUST end with "-- X sts" showing the exact stitch count.
2. Verify all stitch count mathematics internally before writing output.
3. List every abbreviation used in a dedicated ABBREVIATIONS section.
4. Write ONLY the pattern. No conversational text, no preamble, no sign-off.
5. Include an IMAGE PROMPT line at the start of every section.
6. Use US crochet terminology exclusively.
7. Be specific about yarn weight, hook size, and gauge.
8. IMAGE PROMPTS must show the finished crochet item only — no human hands, no people. Full product view, centred on a clean neutral surface.`;
}

export function buildOutputTemplate_v1(): string {
  return `Output the pattern in EXACTLY this format — no deviations:

---BEGIN PATTERN---
PATTERN NAME: [name]
SKILL LEVEL: [Beginner | Easy | Intermediate | Advanced]
MATERIALS:
- Yarn: [weight, amount, colour(s)]
- Hook: [size]
- Other: [notions]
GAUGE: [X sc × X rows = 4 inches]
FINISHED SIZE: [dimensions]

ABBREVIATIONS:
[code] = [definition]
[repeat for each abbreviation used]

SPECIAL STITCHES: [if any, else omit section]

NOTES:
[construction notes, reading direction, etc.]

SECTIONS:
--- [SECTION NAME] ---
IMAGE PROMPT: [Full product photograph of a finished crochet [item], [colours] yarn, [size] size, displayed on a clean light grey surface, soft even studio lighting, sharp focus on yarn texture, no hands, no people, no text, no watermarks]

Rnd 1: [instruction] -- X sts
Rnd 2: [instruction] -- X sts
[continue for all rounds]

--- [NEXT SECTION] ---
IMAGE PROMPT: [prompt]

[continue all sections]

---END PATTERN---`;
}

const DIFFICULTY_CONSTRAINTS_v1: Record<string, string> = {
  beginner:
    "Single crochet only. No decreases more complex than sc2tog. No colour changes. No special stitches.",
  easy: "Single crochet, half double crochet. Simple shaping. At most one colour change.",
  intermediate:
    "Any standard stitches. Moderate shaping. Colour changes allowed. One special stitch maximum.",
  advanced:
    "Complex stitch patterns, intricate shaping, multiple colour changes, and special techniques are all appropriate.",
};
