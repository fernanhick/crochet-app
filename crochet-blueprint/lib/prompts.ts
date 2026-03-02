// ── Prompt Assembly — matches Blueprint v6.0 Section 5 exactly ─────────────
// Bump this and save a snapshot to lib/prompt-versions/ before making changes.
export const PROMPT_VERSION = "v9";

export interface UserContextArgs {
  type: string;
  description: string;
  difficulty: string;
  colors: string[];
  size: string;
  yarnWeight?: string;
  specialFeatures?: string[];
}

// ── Layer 1: System prompt — never changes ───────────────────────────────
export function buildSystemPrompt(): string {
  return `You are an expert crochet pattern designer with 20+ years of professional experience creating patterns for all skill levels. You specialise in clear, mathematically accurate patterns with precise stitch counts and beginner-friendly instructions.

HARD RULES — you must follow every one:
1. Every round or row MUST end with "-- X sts" showing the exact stitch count.
2. Verify all stitch count mathematics internally before writing output.
3. List every abbreviation used in a dedicated ABBREVIATIONS section.
4. Write ONLY the pattern. No conversational text, no preamble, no sign-off.
5. Use US crochet terminology exclusively.
6. Be specific about yarn weight, hook size, and gauge.
7. If multiple colours are specified, you MUST use ALL of them. Assign each colour to specific body parts or sections. Every section that uses a non-MC colour MUST contain at least one explicit colour change written inside a Rnd or Row line (e.g. "Rnd 5: sc in next 3 sts, change to CC1, sc to end -- 12 sts"). Writing the colour only in the section header is NOT enough — the change must appear inside a round instruction.
8. The FINISHED SIZE in your output MUST match the Target size given. Back-calculate all starting stitch counts, increase rounds, and total row/round counts from your stated gauge to reach that exact size. The yarn amount in MATERIALS must be estimated from your total stitch count × yarn weight.`;
}

// ── Layer 2: Output template — rarely changes ────────────────────────────
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
Rnd 4: with CC1, [instruction] -- X sts
Rnd 5: [instruction], change to MC at end of rnd -- X sts
[continue for all rounds — every colour switch MUST appear inside a Rnd/Row line, not as a standalone note]

--- [NEXT SECTION] ---
[continue all sections]

---END PATTERN---`;
}

// ── Yarn weight → standard gauge reference ─────────────────────────────
// Used to anchor GPT's gauge so stitch-count maths produces the correct size.
const GAUGE_REFERENCE: Record<string, string> = {
  lace: "32 sc × 40 rows = 4 inches  (2.25 mm hook)",
  fingering: "28 sc × 36 rows = 4 inches  (2.75 mm hook)",
  dk: "22 sc × 28 rows = 4 inches  (3.5 mm hook)",
  worsted: "16 sc × 20 rows = 4 inches  (5.0 mm hook)",
  bulky: "12 sc × 16 rows = 4 inches  (6.5 mm hook)",
};

// ── Type-specific instructions ───────────────────────────────────────────
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

// ── Size → concrete dimensions per type ────────────────────────────────
// Values are passed to GPT as exact targets so it doesn't guess.
const SIZE_DIMENSIONS: Record<string, Record<string, string>> = {
  amigurumi: {
    small: "approximately 4 inches (10 cm) tall",
    medium: "approximately 6 inches (15 cm) tall",
    large: "approximately 10 inches (25 cm) tall",
  },
  hat: {
    small: "child size — approximately 18–19 inch circumference",
    medium: "adult medium — approximately 21–22 inch circumference",
    large: "adult large — approximately 23–24 inch circumference",
  },
  scarf: {
    small: "approximately 40 inches (100 cm) long × 4 inches wide",
    medium: "approximately 55 inches (140 cm) long × 6 inches wide",
    large: "approximately 70 inches (178 cm) long × 8 inches wide",
  },
  cowl: {
    small: "approximately 20 inch circumference × 8 inches tall",
    medium: "approximately 24 inch circumference × 10 inches tall",
    large: "approximately 28 inch circumference × 12 inches tall",
  },
  bag: {
    small: "approximately 8 inches wide × 9 inches tall (mini/wristlet)",
    medium: "approximately 12 inches wide × 13 inches tall (tote)",
    large: "approximately 16 inches wide × 16 inches tall (large tote)",
  },
  blanket: {
    small: "approximately 30 × 40 inches (baby blanket)",
    medium: "approximately 50 × 60 inches (throw)",
    large: "approximately 60 × 80 inches (full/queen throw)",
  },
  dishcloth: {
    small: "approximately 7 × 7 inches",
    medium: "approximately 9 × 9 inches",
    large: "approximately 11 × 11 inches",
  },
  shawl: {
    small: "approximately 48 inches wide × 20 inches deep",
    medium: "approximately 60 inches wide × 26 inches deep",
    large: "approximately 72 inches wide × 32 inches deep",
  },
};

function resolveSizeDimensions(type: string, sizeId: string): string {
  const typeMap = SIZE_DIMENSIONS[type];
  if (typeMap && typeMap[sizeId]) return typeMap[sizeId];
  // Fallback for custom or unknown
  return sizeId;
}

// ── Difficulty constraints ───────────────────────────────────────────────
const DIFFICULTY_CONSTRAINTS: Record<string, string> = {
  beginner:
    "Single crochet only. No decreases more complex than sc2tog. No special stitches. Use specified colours across sections.",
  easy: "Single crochet, half double crochet. Simple shaping. Use all specified colours, assigning each to the appropriate body parts.",
  intermediate:
    "Any standard stitches. Moderate shaping. Use all specified colours with clear colour change instructions.",
  advanced:
    "Complex stitch patterns, intricate shaping, multiple colour changes, and special techniques are all appropriate.",
};

// ── Layer 3: User context block — assembled per request ──────────────────
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
  const sizeStr = resolveSizeDimensions(type, size);
  const gaugeRef = GAUGE_REFERENCE[yarnStr] ?? GAUGE_REFERENCE["worsted"];
  const featuresStr =
    specialFeatures && specialFeatures.length > 0
      ? `\nSpecial features to incorporate: ${specialFeatures.join(", ")}.`
      : "";

  // Build explicit colour assignment instruction when multiple colours provided
  const colorInstruction =
    colors.length > 1
      ? `\nColour usage (MANDATORY): You have ${colors.length} colours — ${colorStr}. Designate MC (main colour) and CC1, CC2, etc. Assign each colour to specific body parts. You MUST write the colour change inside the actual Rnd/Row line (e.g. "Rnd 6: sc in next 4 sts, change to CC1, sc to end -- 12 sts"). Do NOT only note the colour in the section header — it must appear inside a round. Every listed colour MUST appear in the worked rounds.`
      : "";

  return `Create a complete crochet pattern with the following specifications:

Type: ${type}
Creative brief: ${description || "A charming, well-crafted design"}
Skill level: ${difficulty}
Colours: ${colorStr}
Target size: ${sizeStr}
Yarn weight: ${yarnStr}
Gauge reference: ${gaugeRef} — use this as your baseline; adjust hook size ±0.5 mm if needed for tension${featuresStr}${colorInstruction}

Construction guidance: ${typeInstructions}

Difficulty constraint: ${difficultyConstraint}

Remember: every round/row must end with "-- X sts".`;
}

// ── Full assembled prompt (all 3 layers) ─────────────────────────────────
export function assemblePrompt(args: UserContextArgs): string {
  return [
    buildSystemPrompt(),
    "",
    buildOutputTemplate(),
    "",
    buildUserContext(args),
    "",
    buildImageInstruction(args),
  ].join("\n");
}

// ── Image instruction — GPT appends IMAGE DESCRIPTION at end of output (v8) ─────
// Parsed out and sent to dall-e-3 in generatePattern.ts. Stripped before storage.
export function buildImageInstruction(args: UserContextArgs): string {
  const colorStr =
    args.colors.length > 0 ? args.colors.join(" and ") : "natural";
  const yarnStr = args.yarnWeight || "worsted";
  return (
    `After ---END PATTERN--- append exactly one line in this format:\n` +
    `IMAGE DESCRIPTION: [a single-sentence photorealistic studio photo description of the finished ${args.type} you just designed, ` +
    `using ${colorStr} ${yarnStr} yarn, on a warm wooden surface, soft studio lighting, sharp yarn texture, no people, no text]`
  );
}
