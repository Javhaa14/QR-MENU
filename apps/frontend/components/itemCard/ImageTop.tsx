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

export default function ImageTop({ item, onAdd }: ItemCardProps) {
  return (
    <CardSurface className="flex h-full flex-col">
      <ItemImage item={item} className="h-48 w-full" />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-2xl text-ink">{item.name}</h3>
            <PricePill price={item.price} currency={item.currency} />
          </div>
          <Description text={item.description} />
          <ItemMeta item={item} />
        </div>
        <div className="mt-auto flex justify-end">
          <AddButton onClick={() => onAdd(item)} />
        </div>
      </div>
    </CardSurface>
  );
}
