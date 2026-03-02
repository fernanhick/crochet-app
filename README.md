# Crochet App — Monorepo

| Folder               | Description                           |
| -------------------- | ------------------------------------- |
| `crochet-blueprint/` | Expo React Native app (iOS + Android) |
| `crochet-admin/`     | Next.js admin dashboard (web)         |

Both projects share the same **Convex** backend and **Clerk** authentication setup.

## Getting started

```bash
# 1. Install dependencies
cd crochet-blueprint && npm install
cd ../crochet-admin   && npm install

# 2. Start Convex backend (required by both apps)
cd crochet-blueprint && npx convex dev

# 3. Start the mobile app (separate terminal)
cd crochet-blueprint && npx expo start

# 4. Start the admin dashboard (separate terminal)
cd crochet-admin && npm run dev   # opens on localhost:3000
```

## Environment variables

**`crochet-blueprint/.env.local`**

```
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

**`crochet-admin/.env.local`**

```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

## Admin access

Set `role: "admin"` in your Clerk user's **Public Metadata** to access the admin dashboard.
