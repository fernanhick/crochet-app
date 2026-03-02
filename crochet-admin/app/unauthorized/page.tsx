import { SignOutButton } from "@clerk/nextjs";

export default function UnauthorizedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
        Access Denied
      </h1>
      <p style={{ color: "#666", margin: 0 }}>
        Your account does not have admin access.
      </p>
      <p style={{ color: "#999", fontSize: 13, margin: 0 }}>
        To grant access: Clerk Dashboard → Users → your account →{" "}
        <strong>Public Metadata</strong> → set <code>{`{"role":"admin"}`}</code>
      </p>
      <SignOutButton>
        <button
          style={{
            marginTop: 8,
            padding: "8px 20px",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Sign out
        </button>
      </SignOutButton>
    </div>
  );
}
