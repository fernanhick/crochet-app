"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 8,
  padding: 20,
  marginBottom: 20,
  boxShadow: "0 1px 4px rgba(0,0,0,.08)",
};
const bigNum: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
  color: "#1a1a2e",
  lineHeight: 1,
};
const subLabel: React.CSSProperties = {
  fontSize: 12,
  color: "#888",
  marginTop: 4,
};
const statGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
  gap: 16,
  marginBottom: 20,
};

function StatCard({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        padding: 16,
        boxShadow: "0 1px 4px rgba(0,0,0,.08)",
        textAlign: "center",
      }}
    >
      <div style={bigNum}>{value}</div>
      <div style={subLabel}>{label}</div>
    </div>
  );
}

// Simple text-based sparkline bar chart
function Sparkline({
  data,
}: {
  data: { date: string; costUsd: number; count: number }[];
}) {
  if (!data.length)
    return <p style={{ color: "#aaa", fontSize: 13 }}>No data yet</p>;
  const maxCost = Math.max(...data.map((d) => d.costUsd), 0.001);
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{ borderCollapse: "collapse", fontSize: 11, minWidth: 400 }}
      >
        <thead>
          <tr>
            <th
              style={{ textAlign: "left", padding: "4px 8px", color: "#888" }}
            >
              Date
            </th>
            <th
              style={{ textAlign: "right", padding: "4px 8px", color: "#888" }}
            >
              Runs
            </th>
            <th style={{ padding: "4px 8px" }}></th>
            <th
              style={{ textAlign: "right", padding: "4px 8px", color: "#888" }}
            >
              Cost
            </th>
            <th style={{ padding: "4px 8px" }}></th>
          </tr>
        </thead>
        <tbody>
          {[...data].reverse().map((d) => {
            const countPct = (d.count / maxCount) * 120;
            const costPct = (d.costUsd / maxCost) * 120;
            return (
              <tr key={d.date}>
                <td style={{ padding: "2px 8px", color: "#555" }}>{d.date}</td>
                <td
                  style={{
                    padding: "2px 8px",
                    textAlign: "right",
                    fontWeight: 600,
                  }}
                >
                  {d.count}
                </td>
                <td style={{ padding: "2px 8px" }}>
                  <div
                    style={{
                      width: countPct,
                      height: 10,
                      background: "#4d96ff",
                      borderRadius: 2,
                    }}
                  />
                </td>
                <td
                  style={{
                    padding: "2px 8px",
                    textAlign: "right",
                    fontWeight: 600,
                  }}
                >
                  ${d.costUsd.toFixed(2)}
                </td>
                <td style={{ padding: "2px 8px" }}>
                  <div
                    style={{
                      width: costPct,
                      height: 10,
                      background: "#ffd93d",
                      borderRadius: 2,
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function StatsPage() {
  const stats: any = useQuery(api.queries.admin.getStats, {});

  if (stats === undefined) return <p style={{ color: "#888" }}>Loading…</p>;
  if (!stats) return <p style={{ color: "red" }}>Failed to load stats</p>;

  const pct = (n: number) =>
    stats.total ? `${((n / stats.total) * 100).toFixed(1)}%` : "—";

  // Sort types by count
  const topTypes = Object.entries(stats.typeCounts as Record<string, number>)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  return (
    <div>
      <h1 style={{ margin: "0 0 20px", fontSize: 22 }}>Stats Dashboard</h1>

      {/* Top numbers */}
      <div style={statGrid}>
        <StatCard value={stats.total} label="Total generations" />
        <StatCard
          value={`${(stats.successRate * 100).toFixed(1)}%`}
          label={`Success rate (${stats.succeeded}/${stats.total})`}
        />
        <StatCard
          value={pct(stats.partial)}
          label={`Partial — img errors (${stats.partial})`}
        />
        <StatCard
          value={pct(stats.failed)}
          label={`Failed (${stats.failed})`}
        />
        <StatCard
          value={`$${stats.totalCostUsd.toFixed(2)}`}
          label="Total cost to date"
        />
        <StatCard
          value={`$${stats.avgCostUsd.toFixed(3)}`}
          label="Avg cost / run"
        />
        <StatCard value={`👍 ${stats.ratedUp}`} label="Thumbs up" />
        <StatCard value={`👎 ${stats.ratedDown}`} label="Thumbs down" />
      </div>

      {/* Type breakdown */}
      {topTypes.length > 0 && (
        <section style={card}>
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: 14,
              textTransform: "uppercase",
              color: "#888",
              letterSpacing: 1,
            }}
          >
            Top Types
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {topTypes.map(([type, count]) => (
              <div
                key={type}
                style={{
                  background: "#f0f4ff",
                  borderRadius: 6,
                  padding: "8px 16px",
                  fontSize: 13,
                }}
              >
                <strong>{type}</strong>{" "}
                <span style={{ color: "#888" }}>
                  {count} ({pct(count)})
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily chart */}
      <section style={card}>
        <h2
          style={{
            margin: "0 0 12px",
            fontSize: 14,
            textTransform: "uppercase",
            color: "#888",
            letterSpacing: 1,
          }}
        >
          Daily Activity
        </h2>
        <Sparkline data={stats.dailyCosts} />
      </section>
    </div>
  );
}
