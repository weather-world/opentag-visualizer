export interface Tag {
  tag: string;
  value: string | number | boolean;
  confidence: number;
  evidence: string;
  sample_size: number;
  source: string;
  timestamp: string;
}

export interface TagRegistry {
  [entityKey: string]: Tag[];
}

export type EntityType = "player" | "team" | "champion" | "duo" | "matchup" | "matchup_champ" | "pattern";

export interface EntityInfo {
  key: string;
  type: EntityType;
  name: string;
  tags: Tag[];
  tagCount: number;
  avgConfidence: number;
}

export interface Pattern {
  type: string;
  [key: string]: unknown;
  interpretation: string;
}

export type PatternType =
  | "single_correlation"
  | "conditional_wr"
  | "champion_wr_deviation"
  | "combination"
  | "win_condition"
  | "team_deviation";

export const TAG_PREFIX_COLORS: Record<string, string> = {
  combat: "tag-combat",
  meta: "tag-meta",
  champ: "tag-champ",
  vision: "tag-vision",
  laning: "tag-laning",
  build: "tag-build",
  rune: "tag-rune",
  rank: "tag-rank",
  side: "tag-side",
  objective: "tag-objective",
  draft: "tag-draft",
};

export function getTagClass(tag: string): string {
  const prefix = tag.split(":")[0];
  return TAG_PREFIX_COLORS[prefix] || "tag-default";
}

export const ENTITY_TYPE_ICONS: Record<EntityType, string> = {
  player: "👤",
  team: "🏢",
  champion: "⚔️",
  duo: "👥",
  matchup: "🆚",
  matchup_champ: "🎯",
  pattern: "📐",
};

export const ENTITY_TYPE_COLORS: Record<EntityType, string> = {
  player: "#3b82f6",
  team: "#8b5cf6",
  champion: "#ef4444",
  duo: "#06b6d4",
  matchup: "#f59e0b",
  matchup_champ: "#ec4899",
  pattern: "#10b981",
};

export function parseEntityKey(key: string): { type: EntityType; name: string } {
  const idx = key.indexOf(":");
  return {
    type: key.substring(0, idx) as EntityType,
    name: key.substring(idx + 1),
  };
}

export function confidenceColor(c: number): string {
  if (c >= 0.8) return "#10b981";
  if (c >= 0.6) return "#f59e0b";
  if (c >= 0.4) return "#f97316";
  return "#ef4444";
}
