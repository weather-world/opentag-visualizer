"use client";

import { Tag, getTagClass, confidenceColor } from "@/lib/types";

interface TagPillProps {
  tag: Tag;
  showValue?: boolean;
  onClick?: (tag: Tag) => void;
}

export function TagPill({ tag, showValue = true, onClick }: TagPillProps) {
  const cls = getTagClass(tag.tag);
  const display = showValue && tag.value !== true && tag.value !== ""
    ? `${tag.tag}=${typeof tag.value === "number" ? (Number.isInteger(tag.value) ? tag.value : tag.value.toFixed(2)) : tag.value}`
    : tag.tag;

  return (
    <button
      className={`tag-pill ${cls} cursor-pointer`}
      onClick={() => onClick?.(tag)}
      title={`${tag.evidence}\nConfidence: ${(tag.confidence * 100).toFixed(0)}% | N=${tag.sample_size} | Source: ${tag.source}`}
    >
      <span className="mr-1 inline-block w-1.5 h-1.5 rounded-full" style={{ background: confidenceColor(tag.confidence) }} />
      {display}
    </button>
  );
}
