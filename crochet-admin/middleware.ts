import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/unauthorized",
  "/api/debug-claims",
]);

export default clerkMiddleware(async (auth, req) => {
  // Always allow public pages through
  if (isPublicRoute(req)) return;

  if (isAdminRoute(req)) {
    const { userId } = await auth();

    // Not signed in → redirect to sign-in
    if (!userId) {
      return Response.redirect(new URL("/sign-in", req.url));
    }

    // Fetch user directly from Clerk API — avoids relying on JWT template
    // including public_metadata (which requires a custom JWT template in Clerk).
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = (user.publicMetadata as any)?.role;

    if (role !== "admin") {
      return Response.redirect(new URL("/unauthorized", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
