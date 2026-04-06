"use client";

import type { CategoryNavProps } from "@qr-menu/shared-types";

export default function ScrollTabs({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryNavProps) {
  return (
    <div className="sticky top-[4.9rem] z-20 -mx-1 overflow-x-auto px-1 py-1">
      <div className="inline-flex min-w-full gap-3">
        {categories.map((category) => {
          const isActive = activeCategoryId === category._id;
          return (
            <button
              key={category._id}
              type="button"
              onClick={() => category._id && onSelect?.(category._id)}
              className="whitespace-nowrap rounded-full px-5 py-3 text-sm font-semibold transition shadow-[0_10px_24px_rgba(0,0,0,0.04)]"
              style={{
                background: isActive
                  ? "var(--color-primary)"
                  : "color-mix(in srgb, var(--color-text) 8%, white 92%)",
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
