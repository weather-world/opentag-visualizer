"use client";

interface StatsCardsProps {
  totalEntities: number;
  totalTags: number;
  totalPatterns: number;
  prefixCount: number;
}

export function StatsCards({ totalEntities, totalTags, totalPatterns, prefixCount }: StatsCardsProps) {
  const stats = [
    { label: "Entities", value: totalEntities, icon: "🔮", color: "#8b5cf6" },
    { label: "Tags", value: totalTags.toLocaleString(), icon: "🏷️", color: "#3b82f6" },
    { label: "Patterns", value: totalPatterns, icon: "📐", color: "#10b981" },
    { label: "Prefixes", value: prefixCount, icon: "📊", color: "#f59e0b" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl p-4"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{s.icon}</span>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{s.label}</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: s.color }}>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}
