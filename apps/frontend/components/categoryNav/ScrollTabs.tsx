"use client";

import type { CategoryNavProps } from "@qr-menu/shared-types";

export default function ScrollTabs({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryNavProps) {
  return (
    <div className="sticky top-3 z-20 -mx-2 overflow-x-auto px-2">
      <div className="glass-panel inline-flex min-w-full gap-2 rounded-full p-2">
        {categories.map((category) => {
          const isActive = activeCategoryId === category._id;
          return (
            <button
              key={category._id}
              type="button"
              onClick={() => category._id && onSelect?.(category._id)}
              className="whitespace-nowrap rounded-full px-4 py-2 text-sm transition"
              style={{
                background: isActive ? "var(--color-primary)" : "transparent",
                color: isActive ? "white" : "var(--color-text)",
              }}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
