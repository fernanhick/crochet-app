# CrochetBlueprint

AI-powered crochet pattern generator — Expo (managed workflow) + Convex + Clerk + OpenAI.

---

## Quick Start

### 1. Clone & install
```bash
npm install
```

### 2. Set up Convex
```bash
npx convex dev
```
- Follow the prompts to create/link a Convex project.
- This generates `convex/_generated/` and starts a local dev server.
- Set your OpenAI key in Convex:
  ```bash
  npx convex env set OPENAI_API_KEY sk-...
  ```

### 3. Set up Clerk
- Create a project at [clerk.com](https://clerk.com).
- Copy your **Publishable Key** to `.env.local`:
  ```
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
  ```
- Add your Convex URL (output from `npx convex dev`):
  ```
  EXPO_PUBLIC_CONVEX_URL=https://yourproject.convex.cloud
  ```
- In the Clerk dashboard → **JWT Templates** → create a template named **"convex"** with the Convex JWKS URL.

### 4. Run
```bash
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

---

## Project Structure

```
app/
  _layout.tsx          — Root layout: Clerk + Convex providers, font loading
  onboarding.tsx        — First-launch 3-slide onboarding
  (tabs)/
    _layout.tsx         — Custom bottom tab bar
    index.tsx           — Home screen
    create.tsx          — Form + loading state machine
    library.tsx         — Pattern library with filters
    profile.tsx         — User profile + stats + upgrade prompt
  pattern/[id].tsx      — Full pattern view (3-tab inner nav)
  paywall.tsx           — Upgrade screen (Phase 2)

components/design/
  InkCard.tsx           — Neo-brutalist hard offset shadow card
  StripeRule.tsx        — Horizontal multicolor stripe divider
  ConicGradient.tsx     — SVG pie-slice conic gradient circle
  PillBadge.tsx         — Rounded badge with ink border

convex/
  schema.ts             — DB tables: users + patterns
  actions/generatePattern.ts — OpenAI GPT + DALL-E action
  mutations/savePattern.ts   — savePattern, toggleSaved, ratePattern, …
  queries/getPatterns.ts     — getUserByClerkId, getPatternsByUser, getPatternById

lib/
  constants.ts          — Design tokens: Colors, Font, Shadow, Border, Spacing
  types.ts              — TypeScript interfaces
  prompts.ts            — 3-layer prompt assembly (Blueprint v6 Section 5)
```

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `EXPO_PUBLIC_CONVEX_URL` | `.env.local` | Convex deployment URL |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | `.env.local` | Clerk publishable key |
| `OPENAI_API_KEY` | Convex dashboard env | OpenAI secret key (server-only) |
| `CLERK_SECRET_KEY` | Convex dashboard env | Clerk secret key (Phase 2) |

---

## Tech Stack

| Layer | Package |
|---|---|
| Framework | Expo SDK 55 (managed workflow) |
| Navigation | Expo Router v4 |
| Backend | Convex ^1.32 |
| Auth | @clerk/clerk-expo ^2.19 |
| AI (text) | OpenAI GPT-4o-mini |
| AI (images) | OpenAI DALL-E 3 |
| Payments (Phase 2) | RevenueCat |
| Fonts | @expo-google-fonts/fraunces + nunito |
| Animations | react-native-reanimated 4.x |
| Gradients | expo-linear-gradient |

---

## Phase 2 Checklist

- [ ] Wire RevenueCat for subscription management
- [ ] Uncomment quota check in `generatePattern.ts`
- [ ] Uncomment `incrementUsage` call after generation
- [ ] Gate DALL-E images behind `isPremium` flag
- [ ] PDF export via `expo-print` + `expo-sharing`
- [ ] Push notifications for generation completion
