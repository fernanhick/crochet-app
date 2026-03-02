import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public debug route — remove after auth is confirmed working
export async function GET() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Also fetch user directly from Clerk API to see publicMetadata
  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  return NextResponse.json({
    userId,
    sessionClaims,
    clerkPublicMetadata: user.publicMetadata,
    clerkUnsafeMetadata: user.unsafeMetadata,
  });
}
