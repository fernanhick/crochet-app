/**
 * PROMPT VERSION 3  —  portrait guide card + dall-e-3
 *
 * Changes vs v2:
 * - buildImagePrompt: step-by-step guide card style (hands holding pieces,
 *   warm wooden background, decorative title banner, bold section labels)
 * - Image canvas: portrait 1024×1792 to match reference style
 * - Model switched from gpt-image-1 → dall-e-3 with response_format:"b64_json"
 *
 * Read-only archive — do not edit.
 */

export const VERSION = "v3";

// ── Prompt Assembly — matches Blueprint v6.0 Section 5 exactly ─────────────

export interface UserContextArgs {
  type: string;
  description: string;
  difficulty: string;
  colors: string[];
  size: string;
  yarnWeight?: string;
  specialFeatures?: string[];
}

export function buildSystemPrompt(): string {
  return `You are an expert crochet pattern designer with 20+ years of professional experience creating patterns for all skill levels. You specialise in clear, mathematically accurate patterns with precise stitch counts and beginner-friendly instructions.

HARD RULES — you must follow every one:
1. Every round or row MUST end with "-- X sts" showing the exact stitch count.
2. Verify all stitch count mathematics internally before writing output.
3. List every abbreviation used in a dedicated ABBREVIATIONS section.
4. Write ONLY the pattern. No conversational text, no preamble, no sign-off.
5. Use US crochet terminology exclusively.
6. Be specific about yarn weight, hook size, and gauge.
7. If multiple colours are specified, you MUST use ALL of them. Assign each colour to specific parts/sections and include explicit colour change instructions inline (e.g. "Change to CC at end of Rnd X"). Never ignore a specified colour.`;
}

export function buildOutputTemplate(): string {
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
--- [SECTION NAME] --- (MC = [main colour], CC1 = [contrast colour 1], etc.)
Rnd 1: [instruction] -- X sts
Rnd 2: [instruction] -- X sts
Rnd 3: [instruction], change to CC1 at end of rnd -- X sts
[continue for all rounds, always marking colour changes inline]

--- [NEXT SECTION] ---
[continue all sections]

---END PATTERN---`;
}

const TYPE_INSTRUCTIONS: Record<string, string> = {
  amigurumi:
    "Use magic ring start. Work in continuous rounds. Include safety eye placement round. End with Finish Off and sewing instructions.",
  hat: "Work in rounds from brim up or crown down. Include size-specific stitch counts for Small/Medium/Large. End with weave-in instructions.",
  scarf:
    "Work in rows. Specify blocked vs unblocked dimensions. Include turning chains in stitch counts.",
  cowl: "Work in the round. Specify circumference and height. Include join method at start of each round.",
  bag: "Include base, sides, and handles as separate sections. Specify dimensions and weight capacity note.",
  blanket:
    "Work in rows or squares. Specify a 12-inch swatch gauge. Include assembly if granny square style.",
  dishcloth:
    "Work flat in rows. Square or rectangular. Include border round at end.",
  shawl:
    "Specify increase pattern (every row, every other row, etc.). Include blocking note — blocking is essential.",
};

const DIFFICULTY_CONSTRAINTS: Record<string, string> = {
  beginner:
    "Single crochet only. No decreases more complex than sc2tog. No special stitches. Use specified colours across sections.",
  easy: "Single crochet, half double crochet. Simple shaping. Use all specified colours, assigning each to the appropriate body parts.",
  intermediate:
    "Any standard stitches. Moderate shaping. Use all specified colours with clear colour change instructions.",
  advanced:
    "Complex stitch patterns, intricate shaping, multiple colour changes, and special techniques are all appropriate.",
};

export function buildUserContext(args: UserContextArgs): string {
  const {
    type,
    description,
    difficulty,
    colors,
    size,
    yarnWeight,
    specialFeatures,
  } = args;
  const typeInstructions =
    TYPE_INSTRUCTIONS[type] ||
    "Work from the bottom up. Include all construction details.";
  const difficultyConstraint =
    DIFFICULTY_CONSTRAINTS[difficulty] ||
    "Use appropriate stitches for the skill level.";
  const colorStr = colors.length > 0 ? colors.join(", ") : "any colour";
  const yarnStr = yarnWeight || "worsted";
  const featuresStr =
    specialFeatures && specialFeatures.length > 0
      ? `\nSpecial features to incorporate: ${specialFeatures.join(", ")}.`
      : "";
  const colorInstruction =
    colors.length > 1
      ? `\nColour usage (MANDATORY): You have ${colors.length} colours — ${colorStr}. Designate MC (main colour) and CC1, CC2, etc. Assign each colour to specific sections or body parts based on the creative brief. Include inline colour change instructions (e.g. "change to CC1 at end of rnd") in the relevant rounds. Every colour listed MUST appear in the pattern.`
      : "";
  return `Create a complete crochet pattern with the following specifications:

Type: ${type}
Creative brief: ${description || "A charming, well-crafted design"}
Skill level: ${difficulty}
Colours: ${colorStr}
Size: ${size}
Yarn weight: ${yarnStr}${featuresStr}${colorInstruction}

Construction guidance: ${typeInstructions}

Difficulty constraint: ${difficultyConstraint}

Remember: every round/row must end with "-- X sts".`;
}

export function assemblePrompt(args: UserContextArgs): string {
  return [
    buildSystemPrompt(),
    "",
    buildOutputTemplate(),
    "",
    buildUserContext(args),
  ].join("\n");
}

// ── Image prompt — portrait guide card style (v3) ────────────────────────
export function buildImagePrompt(
  args: UserContextArgs,
  patternName: string,
  sectionNames: string[],
): string {
  const colorStr =
    args.colors.length > 0 ? args.colors.join(" and ") : "natural";
  const yarnStr = args.yarnWeight || "worsted";
  const featuresStr =
    args.specialFeatures && args.specialFeatures.length > 0
      ? `, featuring ${args.specialFeatures.join(", ")}`
      : "";
  const sectionsStr =
    sectionNames.length > 0
      ? sectionNames.join(", ")
      : "HEAD, BODY, LEGS, ASSEMBLY, FINISHED";

  return (
    `Tall portrait crochet pattern guide card for "${patternName}" — a ${args.size} ${args.type}${featuresStr} ` +
    `made with ${colorStr} ${yarnStr} weight yarn. ` +
    `Style: professional amigurumi pattern card photo poster. ` +
    `At the very top, a decorative header area with the title "${patternName}" in large elegant white script font, ` +
    `and a subtitle "— ${args.type} Pattern —" in smaller white serif text beneath it, set against a warm dark wooden plank background. ` +
    `Below the header, a grid of rectangular photo panels filling the rest of the card on the same wooden background. ` +
    `Each panel shows a human hand gently cradling or presenting the crocheted piece for that construction step. ` +
    `Panels in order: ${sectionsStr}. ` +
    `Each panel has a bold white uppercase section label in the top-left corner and a short italic white caption below the piece describing the step. ` +
    `The final panel shows the completed finished item labelled "FINISHED!" ` +
    `Consistent warm studio lighting across all panels. Photorealistic, sharp yarn texture. No watermarks, no logos.`
  );
}
