"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { ConvexErrorBoundary } from "@/components/ConvexErrorBoundary";

const STATUS_COLOR: Record<string, string> = {
  success: "#28a745",
  partial: "#e6a817",
  failed: "#dc3545",
};

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
};

function fmt(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function UserResults({ email }: { email: string }) {
  const data: any = useQuery(api.queries.admin.getUserLogs, {
    email,
    paginationOpts: { numItems: 100, cursor: null } as any,
  });

  if (data === undefined) return <p style={{ color: "#888" }}>Loading…</p>;

  const logs: any[] = data?.page ?? [];

  if (!logs.length)
    return (
      <p style={{ color: "#aaa", marginTop: 16 }}>No results for "{email}"</p>
    );

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ display: "flex", gap: 24, marginBottom: 16, fontSize: 13 }}>
        <span>
          <strong>{logs.length}</strong> generations found
        </span>
        <span>
          Total cost: <strong>${(data.totalCost ?? 0).toFixed(3)}</strong>
        </span>
        <span>
          Premium: <strong>{data.isPremium ? "Yes" : "No"}</strong>
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
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Brief</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Cost</th>
              <th style={thStyle}>Rating</th>
              <th style={thStyle}>Detail</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log: any) => (
              <tr key={log._id}>
                <td style={tdStyle}>{fmt(log.createdAt)}</td>
                <td style={tdStyle}>{log.inputs?.type ?? "—"}</td>
                <td
                  style={{
                    ...tdStyle,
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {log.inputs?.description || "—"}
                </td>
                <td style={tdStyle}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: STATUS_COLOR[log.status],
                    }}
                  >
                    {log.status}
                  </span>
                </td>
                <td style={tdStyle}>${(log.totalCostUsd ?? 0).toFixed(3)}</td>
                <td style={tdStyle}>
                  {log.userRating === "up"
                    ? "👍"
                    : log.userRating === "down"
                      ? "👎"
                      : "—"}
                </td>
                <td style={tdStyle}>
                  <Link
                    href={`/admin/${log._id}`}
                    style={{ color: "#4d96ff", fontSize: 12 }}
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ConvexErrorBoundary>
      <UsersContents />
    </ConvexErrorBoundary>
  );
}

function UsersContents() {
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  return (
    <div>
      <h1 style={{ margin: "0 0 20px", fontSize: 22 }}>User Lookup</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(input.trim());
        }}
        style={{ display: "flex", gap: 8, marginBottom: 8 }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by email…"
          style={{
            flex: 1,
            maxWidth: 400,
            padding: "10px 14px",
            borderRadius: 6,
            border: "1.5px solid #d0d0d0",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#1a1a2e",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Search
        </button>
      </form>

      {search && <UserResults email={search} />}
    </div>
  );
}
