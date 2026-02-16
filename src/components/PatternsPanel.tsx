"use client";

import { Pattern } from "@/lib/types";
import { useState, useMemo } from "react";

interface PatternsPanelProps {
  patterns: Pattern[];
}

const TYPE_ICONS: Record<string, string> = {
  single_correlation: "📈",
  conditional_wr: "🎯",
  champion_wr_deviation: "⚔️",
  combination: "🔗",
  win_condition: "🏆",
  team_deviation: "📊",
};

const TYPE_COLORS: Record<string, string> = {
  single_correlation: "#3b82f6",
  conditional_wr: "#10b981",
  champion_wr_deviation: "#ef4444",
  combination: "#8b5cf6",
  win_condition: "#f59e0b",
  team_deviation: "#06b6d4",
};

function PatternCard({ pattern }: { pattern: Pattern }) {
  const [expanded, setExpanded] = useState(false);
  const color = TYPE_COLORS[pattern.type] || "#9ca3af";
  const icon = TYPE_ICONS[pattern.type] || "📐";

  const strength = (() => {
    if ("correlation" in pattern) {
      const r = Math.abs(Number(pattern.correlation));
      if (r >= 0.7) return { label: "STRONG", color: "#10b981" };
      if (r >= 0.4) return { label: "MODERATE", color: "#f59e0b" };
      return { label: "WEAK", color: "#ef4444" };
    }
    if ("gap" in pattern) {
      const g = Math.abs(Number(pattern.gap));
      if (g >= 0.5) return { label: "HIGH", color: "#10b981" };
      if (g >= 0.3) return { label: "MODERATE", color: "#f59e0b" };
      return { label: "LOW", color: "#ef4444" };
    }
    if ("effect_size" in pattern) {
      const e = Math.abs(Number(pattern.effect_size));
      if (e >= 1.5) return { label: "LARGE", color: "#10b981" };
      if (e >= 0.8) return { label: "MEDIUM", color: "#f59e0b" };
      return { label: "SMALL", color: "#ef4444" };
    }
    return null;
  })();

  return (
    <div
      className="rounded-lg p-3 cursor-pointer transition-all hover:scale-[1.01]"
      style={{ background: "var(--bg-card)", border: `1px solid ${expanded ? color : "var(--border)"}` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2">
        <span className="text-lg">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
              {pattern.type.replace(/_/g, " ")}
            </span>
            {strength && (
              <span className="text-xs font-medium" style={{ color: strength.color }}>
                {strength.label}
              </span>
            )}
            {"n" in pattern && (
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                N={String(pattern.n)}
              </span>
            )}
            {"n_both" in pattern && (
              <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                N={String(pattern.n_both)}
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>
            {pattern.interpretation}
          </p>
          {expanded && (
            <div className="mt-2 p-2 rounded text-xs font-mono" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
              {Object.entries(pattern)
                .filter(([k]) => k !== "interpretation" && k !== "type")
                .map(([k, v]) => (
                  <div key={k}>
                    <span style={{ color }}>{k}</span>: {JSON.stringify(v)}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PatternsPanel({ patterns }: PatternsPanelProps) {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"strength" | "type" | "sample">("strength");

  const types = useMemo(() => {
    const counts: Record<string, number> = {};
    patterns.forEach((p) => {
      counts[p.type] = (counts[p.type] || 0) + 1;
    });
    return Object.entries(counts).sort(([, a], [, b]) => b - a);
  }, [patterns]);

  const filtered = useMemo(() => {
    let list = typeFilter ? patterns.filter((p) => p.type === typeFilter) : patterns;
    list = [...list].sort((a, b) => {
      if (sortBy === "strength") {
        const getStrength = (p: Pattern) => {
          if ("correlation" in p) return Math.abs(Number(p.correlation));
          if ("gap" in p) return Math.abs(Number(p.gap));
          if ("effect_size" in p) return Math.abs(Number(p.effect_size));
          if ("z_score" in p) return Math.abs(Number(p.z_score));
          return 0;
        };
        return getStrength(b) - getStrength(a);
      }
      if (sortBy === "sample") {
        const getN = (p: Pattern) => Number(p.n || p.n_both || p.games || 0);
        return getN(b) - getN(a);
      }
      return a.type.localeCompare(b.type);
    });
    return list;
  }, [patterns, typeFilter, sortBy]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📐</span>
          <h2 className="text-lg font-bold">Auto-Discovered Patterns</h2>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>({patterns.length})</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          <button
            onClick={() => setTypeFilter(null)}
            className="px-2 py-0.5 rounded text-xs transition-colors"
            style={{
              background: !typeFilter ? "var(--accent-blue)" : "var(--bg-primary)",
              color: !typeFilter ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            All
          </button>
          {types.map(([type, count]) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type === typeFilter ? null : type)}
              className="px-2 py-0.5 rounded text-xs transition-colors"
              style={{
                background: typeFilter === type ? (TYPE_COLORS[type] || "#666") : "var(--bg-primary)",
                color: typeFilter === type ? "white" : "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              {TYPE_ICONS[type] || "📐"} {type.replace(/_/g, " ")} ({count})
            </button>
          ))}
        </div>

        <div className="flex gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
          <span>Sort:</span>
          {(["strength", "type", "sample"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={sortBy === s ? "text-blue-400 font-medium" : "hover:text-gray-300"}
            >
              {s === "strength" ? "Strength" : s === "type" ? "Type" : "Sample"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filtered.map((p, i) => (
          <PatternCard key={i} pattern={p} />
        ))}
      </div>
    </div>
  );
}
