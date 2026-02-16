import { TagRegistry, Pattern, EntityInfo, parseEntityKey, EntityType } from "./types";

let _tags: TagRegistry | null = null;
let _patterns: Pattern[] | null = null;

export async function loadTags(): Promise<TagRegistry> {
  if (_tags) return _tags;
  const basePath = process.env.NODE_ENV === "production" ? "/opentag-visualizer" : "";
  const res = await fetch(`${basePath}/data/tags.json`);
  _tags = await res.json();
  return _tags!;
}

export async function loadPatterns(): Promise<Pattern[]> {
  if (_patterns) return _patterns;
  const basePath = process.env.NODE_ENV === "production" ? "/opentag-visualizer" : "";
  const res = await fetch(`${basePath}/data/patterns.json`);
  _patterns = await res.json();
  return _patterns!;
}

export function buildEntityList(registry: TagRegistry): EntityInfo[] {
  return Object.entries(registry).map(([key, tags]) => {
    const { type, name } = parseEntityKey(key);
    const avgConf = tags.length > 0 ? tags.reduce((s, t) => s + t.confidence, 0) / tags.length : 0;
    return {
      key,
      type,
      name,
      tags,
      tagCount: tags.length,
      avgConfidence: avgConf,
    };
  });
}

export function getTagPrefixStats(registry: TagRegistry): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const tags of Object.values(registry)) {
    for (const t of tags) {
      const p = t.tag.split(":")[0];
      counts[p] = (counts[p] || 0) + 1;
    }
  }
  return counts;
}

export function getEntityTypeStats(registry: TagRegistry): Record<EntityType, number> {
  const counts: Record<string, number> = {};
  for (const key of Object.keys(registry)) {
    const { type } = parseEntityKey(key);
    counts[type] = (counts[type] || 0) + 1;
  }
  return counts as Record<EntityType, number>;
}

export function getTeamPlayers(registry: TagRegistry, teamName: string): EntityInfo[] {
  const entities = buildEntityList(registry);
  return entities.filter((e) => {
    if (e.type !== "player") return false;
    const teamTag = e.tags.find((t) => t.tag === "info:team");
    return teamTag && teamTag.value === teamName;
  });
}

export function searchEntities(entities: EntityInfo[], query: string): EntityInfo[] {
  const q = query.toLowerCase();
  return entities.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.type.includes(q) ||
      e.tags.some((t) => t.tag.toLowerCase().includes(q) || String(t.value).toLowerCase().includes(q))
  );
}
