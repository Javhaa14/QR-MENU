"use client";

import type { ItemCardProps } from "@qr-menu/shared-types";

import {
  AddButton,
  CardSurface,
  Description,
  ItemImage,
  ItemMeta,
  PricePill,
} from "./shared";

export default function ImageLeft({
  item,
  onAdd,
  showAddButton = true,
  viewportMode = "responsive",
}: ItemCardProps) {
  const isMobile = viewportMode === "mobile";

  return (
    <CardSurface
      className={`grid overflow-hidden ${
        isMobile ? "" : "md:grid-cols-[0.42fr_0.58fr]"
      }`}
    >
      <ItemImage
        item={item}
        className={`w-full ${isMobile ? "h-52" : "h-52 md:h-full"}`}
      />
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h3 className="font-display text-2xl text-ink">{item.name}</h3>
            <Description text={item.description} />
          </div>
          <PricePill price={item.price} currency={item.currency} />
        </div>
        <ItemMeta item={item} />
        {showAddButton && onAdd ? (
          <div className="mt-auto flex justify-end">
            <AddButton onClick={() => onAdd(item)} />
          </div>
        ) : null}
      </div>
    </CardSurface>
  );
}
