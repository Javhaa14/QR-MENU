"use client";

import Link from "next/link";

import { useCart } from "@/providers/CartProvider";
import { formatCurrency } from "@/lib/format";

export function FloatingCartBar({ slug }: { slug: string }) {
  const { itemCount, totalPrice, tableNumber } = useCart();

  if (itemCount === 0) {
    return null;
  }

  const href = tableNumber
    ? `/menu/${slug}/cart?table=${encodeURIComponent(tableNumber)}`
    : `/menu/${slug}/cart`;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 px-4">
      <Link
        href={href}
        className="mx-auto flex max-w-xl items-center justify-between rounded-full px-5 py-4 text-white shadow-[0_24px_50px_rgba(0,0,0,0.22)]"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-accent) 68%, var(--color-primary) 32%))",
        }}
      >
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
            Сагс
          </p>
          <p className="text-sm font-medium">
            {itemCount} бүтээгдэхүүн
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
            Нийт
          </p>
          <p className="text-sm font-semibold">{formatCurrency(totalPrice)}</p>
        </div>
      </Link>
    </div>
  );
}
