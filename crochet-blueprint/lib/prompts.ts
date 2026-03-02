// ── Prompt Assembly — matches Blueprint v6.0 Section 5 exactly ─────────────
// Bump this and save a snapshot to lib/prompt-versions/ before making changes.
export const PROMPT_VERSION = "v10";

export interface UserContextArgs {
  type: string;
  description: string;
  difficulty: string;
  colors: string[];
  size: string;
  yarnWeight?: string;
  specialFeatures?: string[];
}

/** Return type for assemblePrompt — split into system & user roles */
export interface AssembledPrompt {
  system: string;
  user: string;
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
7. If multiple colours are specified, you MUST use ALL of them. Assign each colour to specific body parts or sections. Write the colour change inside a Rnd/Row line (e.g. "Rnd 5: sc in next 3 sts, change to CC1, sc to end -- 12 sts"). The change must appear inside a round instruction, not only in the section header.
8. The FINISHED SIZE in your output MUST match the Target size given. Back-calculate all starting stitch counts, increase rounds, and total row/round counts from your stated gauge to reach that exact size.
9. No single section may exceed 40 rounds or rows. If an item requires more, consolidate with a repeat instruction (e.g. "Rnds 6–30: sc in each st around -- 48 sts" or "Repeat Row 5 for 20 more rows -- 120 sts each"). Never list identical rounds one by one.`;
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

SPECIAL STITCHES: [if any, else omit section]

NOTES:
[construction notes, reading direction, etc.]

SECTIONS:
--- [SECTION NAME] ---
Rnd 1: [instruction] -- X sts
Rnd 2: [instruction] -- X sts
[continue — colour changes must appear inside Rnd/Row lines per Rule 7]

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
    "Use magic ring start. Work in continuous rounds. " +
    "Each body part (head, body, arms, legs, ears, tail, accessories) MUST be a separate section. " +
    "Structure each part with the correct shaping cycle: increase rounds (magic ring → target width, typically 30–48 sts for a 6-inch piece), " +
    "then even rounds (sc in each st around) to build height, then decrease rounds (sc2tog) to close. " +
    "A 6-inch amigurumi head should peak at about 36 sts with worsted yarn — NOT 100+ sts. " +
    "Arms and legs are small cylinders (12–18 sts). Ears are flat circles (6–18 sts). " +
    "Include safety eye placement round in the head section. " +
    "End with Finish Off and sewing/assembly instructions for attaching all parts.",
  hat: "Work in rounds from brim up or crown down. Include size-specific stitch counts. End with weave-in instructions.",
  scarf:
    "Work in rows. Specify blocked vs unblocked dimensions. Include turning chains in stitch counts.",
  cowl: "Work in the round. Specify circumference and height. Include join method at start of each round.",
  bag: "Include base, sides, and handles as separate sections. Specify dimensions.",
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
  },
  dishcloth: {
    small: "approximately 7 × 7 inches",
    medium: "approximately 9 × 9 inches",
    large: "approximately 11 × 11 inches",
  },
  shawl: {
    small: "approximately 48 inches wide × 20 inches deep",
    medium: "approximately 60 inches wide × 26 inches deep",
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
  const { type, description, difficulty, colors, size, yarnWeight } = args;

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

  // Concise colour note — full rules are in system prompt Rule 7
  const colorNote =
    colors.length > 1
      ? `\nColours: ${colorStr}. Designate MC and CC1${colors.length > 2 ? ", CC2" : ""}. Apply Rule 7.`
      : "";

  return `Create a complete crochet pattern with the following specifications:

Type: ${type}
Creative brief: ${description || "A charming, well-crafted design"}
Skill level: ${difficulty}
Colours: ${colorStr}
Target size: ${sizeStr}
Yarn weight: ${yarnStr}
Gauge reference: ${gaugeRef} — use this as your baseline; adjust hook size ±0.5 mm if needed for tension${colorNote}

Construction guidance: ${typeInstructions}

Difficulty constraint: ${difficultyConstraint}

Remember: every round/row must end with "-- X sts".`;
}

// ── Full assembled prompt (split system + user for proper role separation) ──
export function assemblePrompt(args: UserContextArgs): AssembledPrompt {
  const system = [buildSystemPrompt(), "", buildOutputTemplate()].join("\n");
  const user = [buildUserContext(args), "", buildImageInstruction(args)].join(
    "\n",
  );
  return { system, user };
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
