"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { EntityType, ENTITY_TYPE_COLORS } from "@/lib/types";

interface TagDistributionChartProps {
  prefixCounts: Record<string, number>;
  entityTypeCounts: Record<EntityType, number>;
}

const PREFIX_COLORS: Record<string, string> = {
  combat: "#ef4444",
  meta: "#8b5cf6",
  rank: "#6366f1",
  champ: "#3b82f6",
  vision: "#06b6d4",
  laning: "#10b981",
  build: "#f59e0b",
  rune: "#ec4899",
  dependency: "#f97316",
  info: "#9ca3af",
  dmg_type: "#dc2626",
  auto: "#22c55e",
  tank: "#64748b",
  side: "#14b8a6",
  situation: "#a855f7",
  stats: "#0ea5e9",
  economy: "#eab308",
  elite: "#c084fc",
  objective: "#fb923c",
  skill: "#2dd4bf",
  tempo: "#818cf8",
  cc: "#f472b6",
  form: "#34d399",
  spells: "#a78bfa",
  record: "#fbbf24",
  lane: "#4ade80",
  pool: "#38bdf8",
  bottom: "#67e8f9",
  comp: "#d946ef",
  draft: "#a855f7",
  style: "#f43f5e",
  flow: "#0891b2",
  phase: "#059669",
  momentum: "#7c3aed",
  bot: "#06b6d4",
  midjg: "#8b5cf6",
  topjg: "#3b82f6",
  clutch: "#dc2626",
  early: "#f97316",
  signal: "#10b981",
};

export function TagDistributionChart({ prefixCounts, entityTypeCounts }: TagDistributionChartProps) {
  const barData = useMemo(() => {
    return Object.entries(prefixCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count, fill: PREFIX_COLORS[name] || "#666" }));
  }, [prefixCounts]);

  const pieData = useMemo(() => {
    return Object.entries(entityTypeCounts)
      .filter(([, count]) => count > 0)
      .map(([type, count]) => ({
        name: type,
        value: count,
        fill: ENTITY_TYPE_COLORS[type as EntityType] || "#666",
      }));
  }, [entityTypeCounts]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Bar chart - tag prefix distribution */}
      <div className="lg:col-span-2 rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
          Tag Distribution by Prefix
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              angle={-45}
              textAnchor="end"
              height={70}
              interval={0}
            />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} width={40} />
            <Tooltip
              contentStyle={{ background: "#1a2235", border: "1px solid #2a3a5c", borderRadius: "8px", color: "#e5e7eb" }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart - entity types */}
      <div className="rounded-xl p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
          Entity Types
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#1a2235", border: "1px solid #2a3a5c", borderRadius: "8px", color: "#e5e7eb" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-2 justify-center">
          {pieData.map((d) => (
            <div key={d.name} className="flex items-center gap-1 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
              <span style={{ color: "var(--text-secondary)" }}>{d.name}</span>
              <span className="font-medium">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
