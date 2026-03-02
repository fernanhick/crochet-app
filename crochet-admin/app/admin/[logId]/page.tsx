"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 8,
  padding: 20,
  marginBottom: 20,
  boxShadow: "0 1px 4px rgba(0,0,0,.08)",
};
const label: React.CSSProperties = {
  fontWeight: 700,
  color: "#555",
  fontSize: 12,
  marginBottom: 6,
  display: "block",
};
const pre: React.CSSProperties = {
  background: "#f8f8f8",
  border: "1px solid #e0e0e0",
  borderRadius: 4,
  padding: 12,
  fontSize: 12,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  maxHeight: 400,
  overflow: "auto",
  margin: 0,
};

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
      <span
        style={{ fontWeight: 700, minWidth: 160, fontSize: 13, color: "#555" }}
      >
        {k}
      </span>
      <span style={{ fontSize: 13 }}>{v}</span>
    </div>
  );
}

function Swatch({ hex }: { hex: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        background: hex,
        border: "1px solid #ccc",
        borderRadius: 3,
        marginRight: 4,
        verticalAlign: "middle",
      }}
      title={hex}
    />
  );
}

function Expandable({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details style={{ marginBottom: 12 }}>
      <summary
        style={{
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 13,
          color: "#1a1a2e",
        }}
      >
        {title}
      </summary>
      <div style={{ marginTop: 8 }}>{children}</div>
    </details>
  );
}

const STATUS_COLOR: Record<string, string> = {
  success: "#28a745",
  partial: "#e6a817",
  failed: "#dc3545",
};

export default function DetailPage() {
  const params = useParams();
  const logId = params.logId as string;
  const log: any = useQuery(api.queries.admin.getGenerationLog, {
    logId: logId as any,
  });

  if (log === undefined) return <p style={{ color: "#888" }}>Loading…</p>;
  if (log === null) return <p style={{ color: "red" }}>Log not found</p>;

  const inp = log.inputs ?? {};
  const ps = log.promptSent ?? {};
  const tMs = log.textGenerationMs ?? 0;
  const iMs = log.imageGenerationMs ?? 0;
  const tot = log.totalGenerationMs ?? 0;

  return (
    <div>
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <Link href="/admin" style={{ fontSize: 13, color: "#4d96ff" }}>
          ← Feed
        </Link>
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 700,
            background: STATUS_COLOR[log.status] + "22",
            color: STATUS_COLOR[log.status],
          }}
        >
          {log.status}
        </span>
        <span style={{ fontSize: 13, color: "#888" }}>
          {new Date(log.createdAt).toLocaleString()}
        </span>
      </div>

      {/* INPUTS */}
      <section style={card}>
        <h2
          style={{
            margin: "0 0 14px",
            fontSize: 14,
            textTransform: "uppercase",
            color: "#888",
            letterSpacing: 1,
          }}
        >
          Inputs
        </h2>
        <Row k="User" v={log.userEmail || "—"} />
        <Row k="Premium" v={log.isPremium ? "Yes" : "No"} />
        <Row k="Type" v={inp.type ?? "—"} />
        <Row k="Difficulty" v={inp.difficulty ?? "—"} />
        <Row k="Size" v={inp.size ?? "—"} />
        <Row k="Yarn weight" v={inp.yarnWeight ?? "—"} />
        <Row
          k="Colors"
          v={(inp.colors ?? []).map((c: string) => (
            <span key={c}>
              <Swatch hex={c} />
              {c}
            </span>
          ))}
        />
        {(inp.specialFeatures ?? []).length > 0 && (
          <Row
            k="Special features"
            v={(inp.specialFeatures as string[]).join(", ")}
          />
        )}
        <Row k="Brief" v={<em>{inp.description || "—"}</em>} />
      </section>

      {/* PROMPT */}
      <section style={card}>
        <h2
          style={{
            margin: "0 0 14px",
            fontSize: 14,
            textTransform: "uppercase",
            color: "#888",
            letterSpacing: 1,
          }}
        >
          Prompt Sent
        </h2>
        <Row k="Model" v={ps.model ?? "—"} />
        <Row k="Temp" v={ps.temperature ?? "—"} />
        <Row k="Prompt version" v={ps.promptVersion ?? "—"} />
        <Expandable title="Full prompt">
          <pre style={pre}>{ps.fullPrompt ?? "—"}</pre>
        </Expandable>
      </section>

      {/* RAW RESPONSE */}
      <section style={card}>
        <h2
          style={{
            margin: "0 0 14px",
            fontSize: 14,
            textTransform: "uppercase",
            color: "#888",
            letterSpacing: 1,
          }}
        >
          Raw AI Response
        </h2>
        <Row k="Sections parsed" v={log.parsedSections ?? 0} />
        <Row
          k="Validation"
          v={
            log.validationPassed ? (
              <span style={{ color: "#28a745", fontWeight: 700 }}>
                ✅ passed
              </span>
            ) : (
              <span style={{ color: "#dc3545", fontWeight: 700 }}>
                ❌ failed
              </span>
            )
          }
        />
        {(log.validationErrors ?? []).length > 0 && (
          <Row
            k="Errors"
            v={
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 16,
                  fontSize: 12,
                  color: "#dc3545",
                }}
              >
                {(log.validationErrors as string[]).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            }
          />
        )}
        <Expandable title="Full raw response">
          <pre style={pre}>{log.rawTextResponse || "—"}</pre>
        </Expandable>
      </section>

      {/* IMAGES */}
      <section style={card}>
        <h2
          style={{
            margin: "0 0 14px",
            fontSize: 14,
            textTransform: "uppercase",
            color: "#888",
            letterSpacing: 1,
          }}
        >
          Images
        </h2>
        <Row k="Requested" v={log.imagesRequested ?? 0} />
        <Row
          k="Succeeded"
          v={`${log.imagesSucceeded ?? 0} / ${log.imagesRequested ?? 0}`}
        />
        {(log.imageErrors ?? []).some((e: string) => e) && (
          <Row
            k="Errors"
            v={
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 16,
                  fontSize: 12,
                  color: "#dc3545",
                }}
              >
                {(log.imageErrors as string[])
                  .filter((e: string) => e)
                  .map((e: string, i: number) => (
                    <li key={i}>{e}</li>
                  ))}
              </ul>
            }
          />
        )}
        <div
          style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}
        >
          {(log.imageUrls ?? [])
            .filter((u: string) => u)
            .map((url: string, i: number) => (
              <div key={i} style={{ textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Image ${i + 1}`}
                  style={{
                    width: 180,
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 6,
                    border: "1px solid #e0e0e0",
                  }}
                />
                <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                  {(log.imagePrompts ?? [])[i] ? (
                    <details>
                      <summary>Prompt</summary>
                      <p
                        style={{
                          fontSize: 11,
                          maxWidth: 180,
                          wordBreak: "break-word",
                          margin: "4px 0 0",
                        }}
                      >
                        {(log.imagePrompts as string[])[i]}
                      </p>
                    </details>
                  ) : null}
                </div>
              </div>
            ))}
          {(log.imagesSucceeded ?? 0) === 0 && (
            <span style={{ fontSize: 13, color: "#aaa" }}>
              No images stored
            </span>
          )}
        </div>
      </section>

      {/* PATTERN TEXT */}
      {log.rawTextResponse && (
        <section style={card}>
          <h2
            style={{
              margin: "0 0 14px",
              fontSize: 14,
              textTransform: "uppercase",
              color: "#888",
              letterSpacing: 1,
            }}
          >
            Pattern Output
          </h2>
          <Expandable title="Full pattern text">
            <pre style={{ ...pre, maxHeight: 600 }}>{log.rawTextResponse}</pre>
          </Expandable>
        </section>
      )}

      {/* PERFORMANCE */}
      <section style={card}>
        <h2
          style={{
            margin: "0 0 14px",
            fontSize: 14,
            textTransform: "uppercase",
            color: "#888",
            letterSpacing: 1,
          }}
        >
          Performance & Cost
        </h2>
        <Row k="Text generation" v={`${tMs.toLocaleString()} ms`} />
        <Row k="Image generation" v={`${iMs.toLocaleString()} ms`} />
        <Row k="Total" v={<strong>{tot.toLocaleString()} ms</strong>} />
        <Row k="Tokens in" v={(log.textTokensIn ?? 0).toLocaleString()} />
        <Row k="Tokens out" v={(log.textTokensOut ?? 0).toLocaleString()} />
        <Row k="Text cost" v={`$${(log.textCostUsd ?? 0).toFixed(5)}`} />
        <Row k="Image cost" v={`$${(log.imageCostUsd ?? 0).toFixed(3)}`} />
        <Row
          k="Total cost"
          v={<strong>${(log.totalCostUsd ?? 0).toFixed(4)}</strong>}
        />
        <Row
          k="User rating"
          v={
            log.userRating === "up"
              ? "👍"
              : log.userRating === "down"
                ? "👎"
                : "—"
          }
        />
        <Row k="App version" v={log.appVersion ?? "—"} />
      </section>
    </div>
  );
}
