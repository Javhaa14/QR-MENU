"use client";

import type { ItemCardProps } from "@qr-menu/shared-types";

import {
  AddButton,
  CardSurface,
  Description,
  ItemMeta,
  PricePill,
} from "./shared";

export default function NoImage({ item, onAdd }: ItemCardProps) {
  return (
    <CardSurface>
      <div className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h3 className="font-display text-2xl text-ink">{item.name}</h3>
            <Description text={item.description} />
          </div>
          <PricePill price={item.price} currency={item.currency} />
        </div>
        <ItemMeta item={item} />
        <div className="mt-auto flex justify-end">
          <AddButton onClick={() => onAdd(item)} />
        </div>
      </div>
    </CardSurface>
  );
}
