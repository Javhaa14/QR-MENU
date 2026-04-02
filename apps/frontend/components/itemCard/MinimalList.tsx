"use client";

import type { ItemCardProps } from "@qr-menu/shared-types";

import { AddButton, Description, ItemMeta, PricePill } from "./shared";

export default function MinimalList({ item, onAdd }: ItemCardProps) {
  return (
    <article className="grid gap-4 rounded-[calc(var(--radius)+0.1rem)] border border-black/10 bg-white/55 px-4 py-4 md:grid-cols-[1fr_auto_auto] md:items-center">
      <div className="space-y-2">
        <h3 className="font-medium text-ink">{item.name}</h3>
        <Description text={item.description} />
        <ItemMeta item={item} compact />
      </div>
      <PricePill price={item.price} currency={item.currency} />
      <div className="md:justify-self-end">
        <AddButton onClick={() => onAdd(item)} />
      </div>
    </article>
  );
}
