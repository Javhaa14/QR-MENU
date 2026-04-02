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

export default function Magazine({ item, onAdd }: ItemCardProps) {
  return (
    <CardSurface className="relative min-h-[360px]">
      <div className="absolute inset-0">
        <ItemImage item={item} className="h-full w-full" overlay />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/10" />
      <div className="relative flex min-h-[360px] flex-col justify-between p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-[70%] space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-white/60">Signature</p>
            <h3 className="font-display text-3xl leading-tight">{item.name}</h3>
          </div>
          <PricePill
            price={item.price}
            currency={item.currency}
            className="bg-white/90 text-black"
          />
        </div>
        <div className="space-y-4">
          <Description text={item.description} />
          <div className="flex flex-wrap gap-2">
            <ItemMeta item={item} />
          </div>
          <div className="flex justify-end">
            <AddButton onClick={() => onAdd(item)} label="Add dish" />
          </div>
        </div>
      </div>
    </CardSurface>
  );
}
