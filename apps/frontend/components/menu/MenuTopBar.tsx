"use client";

import { MenuOutlined, SearchOutlined } from "@ant-design/icons";

import type { Restaurant, ViewportMode } from "@qr-menu/shared-types";

export function MenuTopBar({
  restaurant,
  onMenuClick,
  onSearchClick,
  viewportMode = "responsive",
}: {
  restaurant: Restaurant;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  viewportMode?: ViewportMode;
}) {
  const isMobile = viewportMode === "mobile";

  return (
    <header
      className={`sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-black/6 backdrop-blur-xl ${
        isMobile ? "-mx-4 px-4 py-4" : "-mx-4 px-4 py-4 md:-mx-6 md:px-6"
      }`}
      style={{
        background:
          "color-mix(in srgb, var(--color-bg) 88%, white 12%)",
      }}
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Ангилал руу очих"
          className="grid h-11 w-11 place-items-center rounded-full border border-black/8 bg-white/70 text-[var(--color-primary)] shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition hover:scale-[1.02]"
        >
          <MenuOutlined />
        </button>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/38">
            Digital Menu
          </p>
          <h1
            className={`truncate font-display font-black tracking-tight text-[var(--color-text)] ${
              isMobile ? "text-xl" : "text-xl md:text-2xl"
            }`}
          >
            {restaurant.name}
          </h1>
        </div>
      </div>

      <button
        type="button"
        onClick={onSearchClick}
        aria-label="Онцлох хэсэг рүү очих"
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/8 bg-white/70 text-[var(--color-text)] shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition hover:scale-[1.02]"
      >
        <SearchOutlined />
      </button>
    </header>
  );
}
