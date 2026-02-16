"use client";

import { EntityInfo, Tag, ENTITY_TYPE_ICONS, confidenceColor } from "@/lib/types";
import { TagPill } from "./TagPill";
import { useMemo, useState } from "react";

interface EntityDetailProps {
  entity: EntityInfo;
  onTagClick?: (tag: Tag) => void;
  onCompare?: (entity: EntityInfo) => void;
}

export function EntityDetail({ entity, onTagClick, onCompare }: EntityDetailProps) {
  const [prefixFilter, setPrefixFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"prefix" | "confidence" | "sample">("prefix");

  const prefixGroups = useMemo(() => {
    const groups: Record<string, Tag[]> = {};
    entity.tags.forEach((t) => {
      const p = t.tag.split(":")[0];
      if (!groups[p]) groups[p] = [];
      groups[p].push(t);
    });
    return groups;
  }, [entity]);

  const sortedPrefixes = useMemo(() => {
    return Object.entries(prefixGroups)
      .sort(([, a], [, b]) => b.length - a.length);
  }, [prefixGroups]);

  const displayTags = useMemo(() => {
    let tags = prefixFilter ? (prefixGroups[prefixFilter] || []) : entity.tags;
    if (sortBy === "confidence") tags = [...tags].sort((a, b) => b.confidence - a.confidence);
    else if (sortBy === "sample") tags = [...tags].sort((a, b) => b.sample_size - a.sample_size);
    else tags = [...tags].sort((a, b) => a.tag.localeCompare(b.tag));
    return tags;
  }, [entity, prefixFilter, prefixGroups, sortBy]);

  const team = entity.tags.find((t) => t.tag === "info:team")?.value;
  const role = entity.tags.find((t) => t.tag === "info:role")?.value;
  const games = entity.tags.find((t) => t.tag === "info:games")?.value;
  const winrate = entity.tags.find((t) => t.tag === "record:winrate")?.value;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{ENTITY_TYPE_ICONS[entity.type]}</span>
              <h2 className="text-xl font-bold">{entity.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                {entity.type}
              </span>
            </div>
            <div className="flex gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              {team && <span>🏢 {String(team)}</span>}
              {role && <span>🎮 {String(role)}</span>}
              {games && <span>📊 {String(games)}G</span>}
              {winrate && <span>🏆 {(Number(winrate) * 100).toFixed(1)}%</span>}
            </div>
          </div>
          <div className="flex gap-2">
            {onCompare && (
              <button
                onClick={() => onCompare(entity)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: "var(--accent-purple)", color: "white" }}
              >
                + Compare
              </button>
            )}
          </div>
        </div>

        {/* Confidence overview */}
        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>Avg Confidence</span>
          <div className="flex-1 h-2 rounded-full" style={{ background: "var(--border)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${entity.avgConfidence * 100}%`, background: confidenceColor(entity.avgConfidence) }}
            />
          </div>
          <span className="text-xs font-mono" style={{ color: confidenceColor(entity.avgConfidence) }}>
            {(entity.avgConfidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Prefix filter bar */}
      <div className="px-4 py-2 flex flex-wrap gap-1 border-b" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => setPrefixFilter(null)}
          className="px-2 py-0.5 rounded text-xs transition-colors"
          style={{
            background: !prefixFilter ? "var(--accent-blue)" : "var(--bg-primary)",
            color: !prefixFilter ? "white" : "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        >
          All ({entity.tagCount})
        </button>
        {sortedPrefixes.map(([prefix, tags]) => (
          <button
            key={prefix}
            onClick={() => setPrefixFilter(prefix === prefixFilter ? null : prefix)}
            className="px-2 py-0.5 rounded text-xs transition-colors"
            style={{
              background: prefixFilter === prefix ? "var(--accent-blue)" : "var(--bg-primary)",
              color: prefixFilter === prefix ? "white" : "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            {prefix} ({tags.length})
          </button>
        ))}
      </div>

      {/* Sort bar */}
      <div className="px-4 py-1 flex gap-2 text-xs border-b" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
        <span>Sort:</span>
        {(["prefix", "confidence", "sample"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={sortBy === s ? "text-blue-400 font-medium" : "hover:text-gray-300"}
          >
            {s === "prefix" ? "Category" : s === "confidence" ? "Confidence" : "Sample Size"}
          </button>
        ))}
      </div>

      {/* Tags */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {displayTags.map((tag, i) => (
            <div key={`${tag.tag}-${i}`} className="flex items-center gap-2 group">
              <TagPill tag={tag} onClick={onTagClick} />
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs" style={{ color: "var(--text-secondary)" }}>
                <span>N={tag.sample_size}</span>
                <span style={{ color: confidenceColor(tag.confidence) }}>{(tag.confidence * 100).toFixed(0)}%</span>
                <span className="max-w-[200px] truncate">{tag.evidence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
