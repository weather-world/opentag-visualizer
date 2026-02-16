"use client";

import { EntityInfo, confidenceColor } from "@/lib/types";
import { TagPill } from "./TagPill";
import { useMemo } from "react";

interface ComparePanelProps {
  entities: EntityInfo[];
  onRemove: (key: string) => void;
}

export function ComparePanel({ entities, onRemove }: ComparePanelProps) {
  const commonPrefixes = useMemo(() => {
    if (entities.length < 2) return [];
    const prefixSets = entities.map((e) => {
      const s = new Set<string>();
      e.tags.forEach((t) => s.add(t.tag.split(":")[0]));
      return s;
    });
    const common = [...prefixSets[0]].filter((p) => prefixSets.every((s) => s.has(p)));
    return common.sort();
  }, [entities]);

  const comparisonRows = useMemo(() => {
    // Find all unique tag names across entities
    const allTags = new Set<string>();
    entities.forEach((e) => e.tags.forEach((t) => {
      if (typeof t.value === "number") allTags.add(t.tag);
    }));

    // Only keep tags present in at least 2 entities
    const rows: { tag: string; values: (number | null)[] }[] = [];
    for (const tagName of allTags) {
      const values = entities.map((e) => {
        const found = e.tags.find((t) => t.tag === tagName);
        return found && typeof found.value === "number" ? found.value : null;
      });
      if (values.filter((v) => v !== null).length >= 2) {
        rows.push({ tag: tagName, values });
      }
    }
    return rows.sort((a, b) => a.tag.localeCompare(b.tag));
  }, [entities]);

  if (entities.length === 0) {
    return (
      <div className="h-full flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
        <div className="text-center">
          <div className="text-4xl mb-2">⚖️</div>
          <p className="text-sm">Select entities to compare</p>
          <p className="text-xs mt-1">Click &quot;+ Compare&quot; on entity detail</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: "var(--border)" }}>
        <span className="text-lg">⚖️</span>
        <h2 className="text-lg font-bold">Compare ({entities.length})</h2>
      </div>

      {/* Entity headers */}
      <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
        <div className="w-40 flex-shrink-0 p-2 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
          Metric
        </div>
        {entities.map((e) => (
          <div key={e.key} className="flex-1 p-2 text-center min-w-0">
            <div className="flex items-center justify-center gap-1">
              <span className="font-medium text-sm truncate">{e.name}</span>
              <button
                onClick={() => onRemove(e.key)}
                className="text-xs text-red-400 hover:text-red-300 flex-shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {e.type} · {e.tagCount} tags
            </div>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="flex-1 overflow-y-auto">
        {comparisonRows.map((row) => {
          const numericValues = row.values.filter((v): v is number => v !== null);
          const max = Math.max(...numericValues);
          const min = Math.min(...numericValues);

          return (
            <div key={row.tag} className="flex border-b hover:bg-[var(--bg-hover)] transition-colors" style={{ borderColor: "var(--border)" }}>
              <div className="w-40 flex-shrink-0 p-2 text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                {row.tag}
              </div>
              {row.values.map((v, i) => (
                <div key={i} className="flex-1 p-2 text-center text-sm font-mono">
                  {v !== null ? (
                    <span
                      className="font-medium"
                      style={{
                        color:
                          numericValues.length > 1
                            ? v === max
                              ? "#10b981"
                              : v === min
                              ? "#ef4444"
                              : "var(--text-primary)"
                            : "var(--text-primary)",
                      }}
                    >
                      {Number.isInteger(v) ? v : v.toFixed(2)}
                    </span>
                  ) : (
                    <span style={{ color: "var(--border)" }}>—</span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
