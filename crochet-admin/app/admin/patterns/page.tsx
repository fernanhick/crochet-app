"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { ConvexErrorBoundary } from "@/components/ConvexErrorBoundary";

const TYPE_EMOJI: Record<string, string> = {
  amigurumi: "🧸",
  hat: "🎩",
  scarf: "🧣",
  cowl: "🔁",
  bag: "👜",
  blanket: "🛏️",
  dishcloth: "🍽️",
  shawl: "🪷",
};

function fmt(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PatternsPage() {
  return (
    <ConvexErrorBoundary>
      <PatternsContents />
    </ConvexErrorBoundary>
  );
}

function PatternsContents() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.queries.admin.listAllPatterns,
    {},
    { initialNumItems: 48 },
  );

  if (status === "LoadingFirstPage") {
    return <p style={{ color: "#888" }}>Loading patterns…</p>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: 0, fontSize: 22 }}>All Patterns</h1>
        <span style={{ fontSize: 13, color: "#888" }}>
          {results.length} loaded
        </span>
      </div>

      {results.length === 0 && (
        <p style={{ color: "#aaa" }}>No patterns generated yet.</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {results.map((p: any) => {
          const heroUrl = p.sectionImages?.HERO ?? "";
          const type = p.metadata?.type ?? "unknown";
          const emoji = TYPE_EMOJI[type] ?? "🧶";

          // Extract pattern name from patternText
          const nameMatch = p.patternText?.match(/PATTERN NAME:\s*(.+)/);
          const name = nameMatch ? nameMatch[1].trim() : "Untitled";

          const colors: string[] = p.metadata?.colors ?? [];

          return (
            <Link
              key={p._id}
              href={p.logId ? `/admin/${p.logId}` : "#"}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 10,
                  overflow: "hidden",
                  boxShadow: "0 1px 4px rgba(0,0,0,.08)",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 4px 16px rgba(0,0,0,.14)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 1px 4px rgba(0,0,0,.08)";
                }}
              >
                {/* Image */}
                <div
                  style={{
                    width: "100%",
                    paddingBottom: "100%",
                    position: "relative",
                    background: "#f5f5f5",
                  }}
                >
                  {heroUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={heroUrl}
                      alt={name}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 48,
                        color: "#ccc",
                      }}
                    >
                      {emoji}
                    </div>
                  )}

                  {/* Type badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      background: "rgba(0,0,0,0.55)",
                      color: "#fff",
                      borderRadius: 4,
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 700,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {emoji} {type}
                  </div>

                  {/* Rating badge */}
                  {p.rating != null && (
                    <div
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        background:
                          p.rating >= 4 ? "#28a74588" : "#dc354588",
                        color: "#fff",
                        borderRadius: 4,
                        padding: "2px 6px",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      ★ {p.rating}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: "10px 12px" }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      marginBottom: 4,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {name}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: "#888",
                      marginBottom: 6,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.userEmail || "—"} · {fmt(p.createdAt)}
                  </div>

                  <div
                    style={{ display: "flex", gap: 6, alignItems: "center" }}
                  >
                    {/* Color swatches */}
                    {colors.slice(0, 4).map((c: string) => (
                      <span
                        key={c}
                        title={c}
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: c,
                          border: "1px solid #ddd",
                          display: "inline-block",
                        }}
                      />
                    ))}
                    <span
                      style={{
                        fontSize: 11,
                        color: "#aaa",
                        marginLeft: "auto",
                      }}
                    >
                      {p.metadata?.size ?? ""} · {p.metadata?.yarnWeight ?? ""}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {status === "CanLoadMore" && (
        <button
          onClick={() => loadMore(48)}
          style={{
            marginTop: 24,
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
