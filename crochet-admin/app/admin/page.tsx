"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { ConvexErrorBoundary } from "@/components/ConvexErrorBoundary";

const STATUS_BADGE: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  success: { label: "✅ success", bg: "#d4edda", color: "#155724" },
  partial: { label: "⚠️ partial", bg: "#fff3cd", color: "#856404" },
  failed: { label: "❌ failed", bg: "#f8d7da", color: "#721c24" },
};

function fmt(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function badge(status: string) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.failed;
  return (
    <span
      style={{
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 12,
        background: s.bg,
        color: s.color,
        fontWeight: 600,
      }}
    >
      {s.label}
    </span>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "2px solid #e0e0e0",
  fontSize: 12,
  fontWeight: 700,
  color: "#555",
  whiteSpace: "nowrap",
};
const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #f0f0f0",
  fontSize: 13,
  verticalAlign: "middle",
};

export default function FeedPage() {
  return (
    <ConvexErrorBoundary>
      <FeedContents />
    </ConvexErrorBoundary>
  );
}

function FeedContents() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.queries.admin.listGenerationLogs,
    {},
    { initialNumItems: 50 },
  );

  if (status === "LoadingFirstPage") {
    return <p style={{ color: "#888" }}>Loading…</p>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22 }}>Generation Feed</h1>
        <span style={{ fontSize: 13, color: "#888" }}>
          {results.length} rows loaded
        </span>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 4px rgba(0,0,0,.08)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Difficulty</th>
              <th style={thStyle}>Brief</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Cost</th>
              <th style={thStyle}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {results.map((log: any) => (
              <tr
                key={log._id}
                style={{ cursor: "pointer" }}
                onClick={() => (window.location.href = `/admin/${log._id}`)}
              >
                <td style={tdStyle}>{fmt(log.createdAt)}</td>
                <td
                  style={{
                    ...tdStyle,
                    maxWidth: 160,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {log.userEmail || "—"}
                </td>
                <td style={tdStyle}>{log.inputs?.type ?? "—"}</td>
                <td style={tdStyle}>{log.inputs?.difficulty ?? "—"}</td>
                <td
                  style={{
                    ...tdStyle,
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {log.inputs?.description ?? "—"}
                </td>
                <td style={tdStyle}>{badge(log.status)}</td>
                <td style={tdStyle}>${(log.totalCostUsd ?? 0).toFixed(3)}</td>
                <td style={tdStyle}>
                  {log.userRating === "up"
                    ? "👍"
                    : log.userRating === "down"
                      ? "👎"
                      : "—"}
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  style={{ ...tdStyle, textAlign: "center", color: "#aaa" }}
                >
                  No generations yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {status === "CanLoadMore" && (
        <button
          onClick={() => loadMore(50)}
          style={{
            marginTop: 16,
            padding: "10px 24px",
            cursor: "pointer",
            background: "#1a1a2e",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 14,
          }}
        >
          Load more
        </button>
      )}
    </div>
  );
}
