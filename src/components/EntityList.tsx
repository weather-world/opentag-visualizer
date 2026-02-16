"use client";

import { EntityInfo, ENTITY_TYPE_ICONS, ENTITY_TYPE_COLORS, EntityType, confidenceColor } from "@/lib/types";
import { useState, useMemo } from "react";

interface EntityListProps {
  entities: EntityInfo[];
  onSelect: (entity: EntityInfo) => void;
  selected?: string;
}

type SortKey = "name" | "tagCount" | "avgConfidence";

export function EntityList({ entities, onSelect, selected }: EntityListProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EntityType | "all">("all");
  const [sortBy, setSortBy] = useState<SortKey>("tagCount");

  const types = useMemo(() => {
    const t = new Set<EntityType>();
    entities.forEach((e) => t.add(e.type));
    return Array.from(t).sort();
  }, [entities]);

  const filtered = useMemo(() => {
    let list = entities;
    if (typeFilter !== "all") list = list.filter((e) => e.type === typeFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.tags.some((t) => t.tag.includes(q) || String(t.value).toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "tagCount") return b.tagCount - a.tagCount;
      return b.avgConfidence - a.avgConfidence;
    });
    return list;
  }, [entities, typeFilter, search, sortBy]);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
        <input
          type="text"
          placeholder="Search entities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: "var(--bg-primary)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
        />
      </div>

      {/* Type filters */}
      <div className="px-3 py-2 flex flex-wrap gap-1 border-b" style={{ borderColor: "var(--border)" }}>
        <button
          onClick={() => setTypeFilter("all")}
          className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${typeFilter === "all" ? "text-white" : ""}`}
          style={{
            background: typeFilter === "all" ? "var(--accent-blue)" : "var(--bg-primary)",
            border: "1px solid var(--border)",
          }}
        >
          All ({entities.length})
        </button>
        {types.map((t) => {
          const count = entities.filter((e) => e.type === t).length;
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-colors`}
              style={{
                background: typeFilter === t ? ENTITY_TYPE_COLORS[t] : "var(--bg-primary)",
                color: typeFilter === t ? "white" : "var(--text-secondary)",
                border: `1px solid ${typeFilter === t ? ENTITY_TYPE_COLORS[t] : "var(--border)"}`,
              }}
            >
              {ENTITY_TYPE_ICONS[t]} {t} ({count})
            </button>
          );
        })}
      </div>

      {/* Sort */}
      <div className="px-3 py-1 flex gap-2 text-xs border-b" style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}>
        <span>Sort:</span>
        {(["tagCount", "name", "avgConfidence"] as SortKey[]).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`${sortBy === s ? "text-blue-400 font-medium" : "hover:text-gray-300"}`}
          >
            {s === "tagCount" ? "Tags" : s === "name" ? "Name" : "Confidence"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((entity) => (
          <button
            key={entity.key}
            onClick={() => onSelect(entity)}
            className="w-full text-left px-3 py-2.5 border-b transition-colors"
            style={{
              borderColor: "var(--border)",
              background: selected === entity.key ? "var(--bg-hover)" : "transparent",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base flex-shrink-0">{ENTITY_TYPE_ICONS[entity.type]}</span>
                <span className="font-medium text-sm truncate">{entity.name}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--bg-primary)", color: "var(--text-secondary)" }}>
                  {entity.tagCount}
                </span>
                <div className="w-8 h-1 rounded-full" style={{ background: "var(--border)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${entity.avgConfidence * 100}%`, background: confidenceColor(entity.avgConfidence) }}
                  />
                </div>
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>No entities found</div>
        )}
      </div>
    </div>
  );
}
