# Crochet App — Copilot Workspace Instructions

## Prompt Versioning Convention

AI prompts are the core product logic for this app. Treat them with the same discipline as source code.

### Files

| File                        | Purpose                                                        |
| --------------------------- | -------------------------------------------------------------- |
| `lib/prompts.ts`            | **Live** prompt — the version currently in production          |
| `lib/prompt-versions/v1.ts` | Archive — original DALL-E 3 / per-section IMAGE PROMPT era     |
| `lib/prompt-versions/v2.ts` | Archive — gpt-image-1 / colour enforcement / single HERO image |

### Rules

1. **Before editing `lib/prompts.ts`**, copy the current file to `lib/prompt-versions/vN.ts` (where N is the next number) and add a header comment explaining what this version was and why it was retired.
2. **After editing**, bump `PROMPT_VERSION` in `lib/prompts.ts` (e.g. `"v2"` → `"v3"`).
3. `generatePattern.ts` reads `PROMPT_VERSION` automatically — no manual update needed there.
4. Archive files are **read-only** — never edit a versioned snapshot.

### Version history

| Version | Key characteristics                                                                                                                                        |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| v1      | GPT writes IMAGE PROMPT per section; DALL-E 3; 4 parallel image calls; difficulty suppresses colour changes                                                |
| v2      | Single gpt-image-1 call; `HERO` image key; hard rule #7 for colours; difficulty no longer suppresses colour changes; `buildImagePrompt()` is deterministic |
| v3      | dall-e-3; portrait 1024×1792; step-by-step guide card style (title banner, hands holding pieces, wooden background, bold section labels, FINISHED! panel)  |

---

## Convex Deployment Rule

**After editing any file inside `convex/`** (actions, mutations, queries, schema, auth config), always run:

```
npx convex dev --once
```

from the `crochet-blueprint/` directory. Do this automatically as the final step — do not leave it to the user.

---

## Project Conventions

- **Backend:** Convex. Run `npx convex dev --once` from `crochet-blueprint/` to deploy.
- **AI text model:** `gpt-4o-mini`
- **AI image model:** `dall-e-3` (portrait 1024×1792, stored as `sectionImages['HERO']`)
- **Section format GPT writes:** `--- SECTION NAME ---` (triple dash, all caps)
- **Section parse regex:** `/^---\s*([A-Z][A-Z\s&]+?)\s*---$/gm`
- **Colours** must always flow through all three prompt layers (system, template, user context).
