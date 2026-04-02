"use client";

import type { ChangeEvent } from "react";

import type { CategoryNavProps } from "@qr-menu/shared-types";

export default function Dropdown({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryNavProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onSelect?.(event.target.value);
  };

  return (
    <label className="grid gap-2">
      <span className="text-xs uppercase tracking-[0.24em] text-black/45">
        Jump to Category
      </span>
      <select
        value={activeCategoryId}
        onChange={handleChange}
        className="rounded-[calc(var(--radius)+0.1rem)] border border-black/10 bg-white/70 px-4 py-3 text-sm text-ink outline-none"
      >
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  );
}
