"use client";

import { PlusOutlined } from "@ant-design/icons";

import type { ItemCardProps } from "@qr-menu/shared-types";

import {
  Description,
  ItemImage,
  ItemMeta,
} from "./shared";
import { formatCurrency } from "@/lib/format";

export default function ImageTop({
  item,
  onAdd,
  showAddButton = true,
  viewportMode = "responsive",
}: ItemCardProps) {
  const isMobile = viewportMode === "mobile";

  return (
    <article className="group flex h-full flex-col gap-4">
      <div className="relative overflow-hidden rounded-[calc(var(--radius)+0.35rem)] bg-white/55 shadow-[0_22px_44px_rgba(0,0,0,0.08)]">
        <ItemImage
          item={item}
          className={`w-full object-cover transition duration-700 group-hover:scale-[1.03] ${
            isMobile ? "aspect-[4/3]" : "h-56 md:h-60"
          }`}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/28 to-transparent" />

        {item.tags[0] ? (
          <span className="absolute left-4 top-4 rounded-full border border-white/25 bg-white/16 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
            {item.tags[0]}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 items-start justify-between gap-4 px-1">
        <div className="max-w-[70%] space-y-2">
          <h3 className="font-display text-xl font-black leading-tight text-ink">
            {item.name}
          </h3>
          <Description text={item.description} />
          {(item.tags.length > 0 || item.allergens.length > 0) && (
            <div className="pt-1">
              <ItemMeta item={item} compact />
            </div>
          )}
        </div>

        <div className="flex min-w-[82px] flex-col items-end gap-3">
          <span
            className="font-display text-xl font-black"
            style={{ color: "var(--color-primary)" }}
          >
            {formatCurrency(item.price, item.currency)}
          </span>

          {showAddButton && onAdd ? (
            <button
              type="button"
              onClick={() => onAdd(item)}
              aria-label={`${item.name} нэмэх`}
              className="grid h-12 w-12 place-items-center rounded-full text-white transition active:scale-95"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 46%, white 54%))",
                boxShadow:
                  "0 18px 30px color-mix(in srgb, var(--color-primary) 28%, transparent)",
              }}
            >
              <PlusOutlined />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
