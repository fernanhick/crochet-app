// Use a local Id type when convex/_generated is not yet available
// Replace with: import type { Id } from '../convex/_generated/dataModel';
type Id<T extends string> = string & { __tableName: T };

// ── Form State ──────────────────────────────────────────────────────────────
export type CrochetType =
  | "amigurumi"
  | "hat"
  | "scarf"
  | "cowl"
  | "bag"
  | "blanket"
  | "dishcloth"
  | "shawl";

export type DifficultyLevel = "beginner" | "easy" | "intermediate" | "advanced";

export type SizeOption = "small" | "medium" | "large" | "custom";

export type YarnWeight = "fingering" | "dk" | "worsted";

// SpecialFeature type removed in v10 — features are now specified via free-text description

/**
 * Form state used in create.tsx
 */
export interface GenerateFormState {
  type: string; // CrochetType id
  description: string; // Free-text creative brief
  size: string;
  difficulty: string;
  colors: string[];
  yarnWeight: string;
  specialFeatures: string[];
}

// ── Pattern data ────────────────────────────────────────────────────────────
export interface PatternSection {
  name: string;
  note?: string;
  imagePrompt?: string;
  imageUrl?: string | null;
  rounds: PatternRound[];
}

export interface PatternRound {
  label: string;
  instruction: string;
  stitchCount?: number;
  isNote?: boolean;
}

export interface ParsedPattern {
  name: string;
  skillLevel: string;
  materials: { label: string; value: string }[];
  gauge: string;
  finishedSize: string;
  abbreviations: { code: string; definition: string }[];
  specialStitches?: string;
  notes: string[];
  sections: PatternSection[];
  rawText: string;
}

// ── Convex record ──────────────────────────────────────────────────────────
/** Shape of a pattern document returned from Convex queries */
export interface PatternRecord {
  _id: Id<"patterns">;
  _creationTime: number;
  userId: Id<"users">;
  patternText: string;
  sectionImages: Record<string, string>;
  metadata: {
    type: string; // crochet type id
    difficulty: string;
    size: string;
    colors: string[];
    yarnWeight: string;
    specialFeatures?: string[];
    promptVersion: string;
    modelUsed: string;
    temperature: number;
  };
  rating?: number;
  isSaved: boolean;
  createdAt: number;
}

export interface UserRecord {
  _id: Id<"users">;
  clerkId: string;
  email: string;
  isPremium: boolean;
  monthlyCount: number;
  monthlyResetAt: number;
  createdAt: number;
}

// ── Generation result ──────────────────────────────────────────────────────
export interface GeneratePatternResult {
  patternId: string;
  patternText: string;
  sectionImages: Record<string, string>;
}

// ── Navigation params ──────────────────────────────────────────────────────
export interface PatternRouteParams {
  id: string;
}
