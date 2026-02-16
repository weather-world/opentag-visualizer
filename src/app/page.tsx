"use client";

import { useEffect, useState, useCallback } from "react";
import { TagRegistry, Pattern, EntityInfo, EntityType } from "@/lib/types";
import { loadTags, loadPatterns, buildEntityList, getTagPrefixStats, getEntityTypeStats } from "@/lib/data";
import { StatsCards } from "@/components/StatsCards";
import { EntityList } from "@/components/EntityList";
import { EntityDetail } from "@/components/EntityDetail";
import { ComparePanel } from "@/components/ComparePanel";
import { PatternsPanel } from "@/components/PatternsPanel";
import { TagDistributionChart } from "@/components/TagDistributionChart";

type Tab = "explorer" | "patterns" | "compare";

export default function Home() {
  const [registry, setRegistry] = useState<TagRegistry | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [entities, setEntities] = useState<EntityInfo[]>([]);
  const [selected, setSelected] = useState<EntityInfo | null>(null);
  const [compareList, setCompareList] = useState<EntityInfo[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("explorer");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([loadTags(), loadPatterns()]).then(([tags, pats]) => {
      setRegistry(tags);
      setPatterns(pats);
      setEntities(buildEntityList(tags));
      setLoading(false);
    });
  }, []);

  const handleSelect = useCallback((entity: EntityInfo) => {
    setSelected(entity);
    setActiveTab("explorer");
  }, []);

  const handleCompare = useCallback((entity: EntityInfo) => {
    setCompareList((prev) => {
      if (prev.find((e) => e.key === entity.key)) return prev;
      return [...prev, entity];
    });
    setActiveTab("compare");
  }, []);

  const handleRemoveCompare = useCallback((key: string) => {
    setCompareList((prev) => prev.filter((e) => e.key !== key));
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🏷️</div>
          <div className="text-lg font-medium">Loading OpenTag System...</div>
          <div className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            218 entities · 4,506 tags · 141 patterns
          </div>
        </div>
      </div>
    );
  }

  const prefixCounts = registry ? getTagPrefixStats(registry) : {};
  const entityTypeCounts = registry ? getEntityTypeStats(registry) : ({} as Record<EntityType, number>);
  const totalTags = Object.values(prefixCounts).reduce((s, c) => s + c, 0);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 px-6 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏷️</span>
          <div>
            <h1 className="text-lg font-bold tracking-tight">OpenTag Visualizer</h1>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              LoL Esports Tag System — LCK Cup 2026
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {([
            { id: "explorer", label: "Explorer", icon: "🔍" },
            { id: "patterns", label: "Patterns", icon: "📐" },
            { id: "compare", label: `Compare${compareList.length ? ` (${compareList.length})` : ""}`, icon: "⚖️" },
          ] as { id: Tab; label: string; icon: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: activeTab === tab.id ? "var(--accent-blue)" : "transparent",
                color: activeTab === tab.id ? "white" : "var(--text-secondary)",
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Stats row */}
      <div className="flex-shrink-0 px-6 py-4" style={{ background: "var(--bg-primary)" }}>
        <StatsCards
          totalEntities={entities.length}
          totalTags={totalTags}
          totalPatterns={patterns.length}
          prefixCount={Object.keys(prefixCounts).length}
        />
      </div>

      {/* Charts row */}
      <div className="flex-shrink-0 px-6 pb-4">
        <TagDistributionChart prefixCounts={prefixCounts} entityTypeCounts={entityTypeCounts} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden" style={{ borderTop: "1px solid var(--border)" }}>
        {/* Entity sidebar */}
        <div className="w-72 flex-shrink-0 border-r overflow-hidden" style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}>
          <EntityList entities={entities} onSelect={handleSelect} selected={selected?.key} />
        </div>

        {/* Main panel */}
        <div className="flex-1 overflow-hidden" style={{ background: "var(--bg-primary)" }}>
          {activeTab === "explorer" && (
            selected ? (
              <EntityDetail entity={selected} onCompare={handleCompare} />
            ) : (
              <div className="h-full flex items-center justify-center" style={{ color: "var(--text-secondary)" }}>
                <div className="text-center">
                  <div className="text-5xl mb-3">🔍</div>
                  <p className="text-lg font-medium">Select an entity</p>
                  <p className="text-sm mt-1">Browse players, teams, champions, and matchups</p>
                </div>
              </div>
            )
          )}
          {activeTab === "patterns" && <PatternsPanel patterns={patterns} />}
          {activeTab === "compare" && <ComparePanel entities={compareList} onRemove={handleRemoveCompare} />}
        </div>
      </div>
    </div>
  );
}
