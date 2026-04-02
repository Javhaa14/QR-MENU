"use client";

import type { CategoryNavProps } from "@qr-menu/shared-types";

export default function SidebarList({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryNavProps) {
  return (
    <div className="grid gap-3 rounded-[calc(var(--radius)+0.5rem)] border border-black/10 bg-white/60 p-4">
      {categories.map((category) => {
        const isActive = activeCategoryId === category._id;
        return (
          <button
            key={category._id}
            type="button"
            onClick={() => category._id && onSelect?.(category._id)}
            className="rounded-[calc(var(--radius)-0.1rem)] px-4 py-3 text-left text-sm transition"
            style={{
              background: isActive
                ? "color-mix(in srgb, var(--color-primary) 16%, white)"
                : "transparent",
              color: "var(--color-text)",
              border: `1px solid ${
                isActive
                  ? "color-mix(in srgb, var(--color-primary) 30%, transparent)"
                  : "rgba(0,0,0,0.06)"
              }`,
            }}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
