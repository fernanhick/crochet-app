import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isPublicRoute = createRouteMatcher(["/sign-in(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Always allow sign-in page through
  if (isPublicRoute(req)) return;

  if (isAdminRoute(req)) {
    const { sessionClaims } = await auth();

    // Not signed in → redirect to sign-in
    if (!sessionClaims) {
      return Response.redirect(new URL("/sign-in", req.url));
    }

    // Signed in but not admin → redirect to sign-in
    const role = (sessionClaims?.metadata as any)?.role;
    if (role !== "admin") {
      return Response.redirect(new URL("/sign-in", req.url));
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
