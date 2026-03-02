import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/unauthorized"]);

export default clerkMiddleware(async (auth, req) => {
  // Always allow public pages through
  if (isPublicRoute(req)) return;

  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();

    // Not signed in → redirect to sign-in
    if (!sessionClaims) {
      return Response.redirect(new URL("/sign-in", req.url));
    }

    // Signed in but not admin → redirect to /unauthorized (NOT /sign-in).
    // Redirecting to /sign-in causes an infinite loop because Clerk sees the
    // user is already authenticated and immediately bounces back to /admin.
    //
    // Clerk serialises publicMetadata as `public_metadata` in the JWT claims.
    // Check all known paths defensively.
    const claims = sessionClaims as any;
    const role =
      claims?.public_metadata?.role ??
      claims?.publicMetadata?.role ??
      claims?.metadata?.role ??
      claims?.role;
    if (role !== "admin") {
      return Response.redirect(new URL("/unauthorized", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
