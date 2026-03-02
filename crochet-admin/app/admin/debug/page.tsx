"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function DebugPage() {
  const { user } = useUser();
  const claims: any = useQuery(api.queries.admin.getIdentityClaims, {});

  return (
    <div>
      <h1 style={{ margin: "0 0 20px", fontSize: 22 }}>Auth Debug</h1>
      <p style={{ fontSize: 13, color: "#888", marginBottom: 20 }}>
        Use this page to verify the role claim is present in the JWT before the
        feed will work. Delete this page once setup is confirmed.
      </p>

      <section
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 20,
          marginBottom: 20,
          boxShadow: "0 1px 4px rgba(0,0,0,.08)",
        }}
      >
        <h2
          style={{
            margin: "0 0 12px",
            fontSize: 14,
            textTransform: "uppercase",
            color: "#888",
            letterSpacing: 1,
          }}
        >
          Clerk User (client-side)
        </h2>
        {user ? (
          <div style={{ fontSize: 13 }}>
            <div>
              <strong>Email:</strong> {user.primaryEmailAddress?.emailAddress}
            </div>
            <div style={{ marginTop: 8 }}>
              <strong>publicMetadata:</strong>
            </div>
            <pre
              style={{
                background: "#f8f8f8",
                border: "1px solid #e0e0e0",
                borderRadius: 4,
                padding: 12,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              {JSON.stringify(user.publicMetadata, null, 2)}
            </pre>
          </div>
        ) : (
          <p style={{ color: "#aaa", fontSize: 13 }}>Not signed in</p>
        )}
      </section>

      <section
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: 20,
          marginBottom: 20,
          boxShadow: "0 1px 4px rgba(0,0,0,.08)",
        }}
      >
        <h2
          style={{
            margin: "0 0 12px",
            fontSize: 14,
            textTransform: "uppercase",
            color: "#888",
            letterSpacing: 1,
          }}
        >
          Convex JWT Claims (server-side)
        </h2>
        {claims === undefined ? (
          <p style={{ color: "#888", fontSize: 13 }}>Loading…</p>
        ) : claims === null ? (
          <p style={{ color: "#dc3545", fontSize: 13 }}>
            Not authenticated in Convex
          </p>
        ) : (
          <pre
            style={{
              background: "#f8f8f8",
              border: "1px solid #e0e0e0",
              borderRadius: 4,
              padding: 12,
              fontSize: 12,
            }}
          >
            {JSON.stringify(claims, null, 2)}
          </pre>
        )}
      </section>

      <section
        style={{
          background: "#fffbea",
          borderRadius: 8,
          padding: 20,
          border: "1px solid #ffe58f",
        }}
      >
        <h2 style={{ margin: "0 0 10px", fontSize: 14 }}>
          How to fix "Forbidden" errors
        </h2>
        <ol
          style={{ fontSize: 13, lineHeight: 1.8, margin: 0, paddingLeft: 20 }}
        >
          <li>
            Go to{" "}
            <strong>Clerk Dashboard → Users → [your account] → Edit</strong>
          </li>
          <li>
            Scroll to <strong>Public metadata</strong> and set:{" "}
            <code
              style={{
                background: "#f0f0f0",
                padding: "1px 5px",
                borderRadius: 3,
              }}
            >{`{"role": "admin"}`}</code>
          </li>
          <li>
            Save, then <strong>sign out and sign back in</strong> to force a new
            JWT
          </li>
          <li>
            Reload this page — the Convex JWT Claims above should show{" "}
            <code
              style={{
                background: "#f0f0f0",
                padding: "1px 5px",
                borderRadius: 3,
              }}
            >
              metadata.role: "admin"
            </code>
          </li>
        </ol>
        <p style={{ fontSize: 13, marginTop: 12, marginBottom: 0 }}>
          If{" "}
          <code
            style={{
              background: "#f0f0f0",
              padding: "1px 5px",
              borderRadius: 3,
            }}
          >
            metadata
          </code>{" "}
          is absent from the JWT claims entirely, you also need to:
        </p>
        <ol
          style={{
            fontSize: 13,
            lineHeight: 1.8,
            margin: "8px 0 0",
            paddingLeft: 20,
          }}
        >
          <li>
            Go to <strong>Clerk Dashboard → JWT Templates</strong>
          </li>
          <li>
            Edit the <strong>Convex</strong> template
          </li>
          <li>
            Add to the claims JSON:{" "}
            <code
              style={{
                background: "#f0f0f0",
                padding: "1px 5px",
                borderRadius: 3,
              }}
            >{`"metadata": "{{user.public_metadata}}"`}</code>
          </li>
          <li>Save and sign out/in again</li>
        </ol>
      </section>
    </div>
  );
}
