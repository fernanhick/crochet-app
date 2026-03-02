"use client";

import React from "react";
import Link from "next/link";

interface State {
  error: Error | null;
}

export class ConvexErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const isForbidden =
      error.message?.toLowerCase().includes("forbidden") ||
      error.message?.toLowerCase().includes("unauthenticated");

    return (
      <div
        style={{
          background: "#fff8f8",
          border: "1px solid #f5c2c7",
          borderRadius: 8,
          padding: 24,
          maxWidth: 600,
        }}
      >
        <h2 style={{ margin: "0 0 8px", color: "#842029", fontSize: 16 }}>
          {isForbidden ? "🔒 Access denied" : "⚠️ Query error"}
        </h2>
        <p
          style={{
            fontFamily: "monospace",
            background: "#fff",
            border: "1px solid #f5c2c7",
            borderRadius: 4,
            padding: "10px 12px",
            fontSize: 13,
            margin: "0 0 16px",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {error.message}
        </p>
        {isForbidden && (
          <p style={{ fontSize: 13, color: "#555", margin: "0 0 12px" }}>
            Your Clerk account likely doesn't have{" "}
            <code
              style={{
                background: "#eee",
                padding: "1px 5px",
                borderRadius: 3,
              }}
            >
              {`{"role": "admin"}`}
            </code>{" "}
            in Public Metadata. See the debug page for step-by-step
            instructions.
          </p>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/admin/debug"
            style={{
              padding: "8px 16px",
              background: "#1a1a2e",
              color: "#fff",
              borderRadius: 5,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Open debug page →
          </Link>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              padding: "8px 16px",
              border: "1px solid #ccc",
              background: "#fff",
              borderRadius: 5,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}
