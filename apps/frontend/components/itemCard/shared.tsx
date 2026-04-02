"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import type { MenuItem } from "@qr-menu/shared-types";

import { formatCurrency } from "@/lib/format";

export function AddButton({
  onClick,
  label = "Add",
}: {
  onClick: () => void;
  label?: string;
}) {
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (!pulsing) {
      return;
    }

    const timer = window.setTimeout(() => setPulsing(false), 180);
    return () => window.clearTimeout(timer);
  }, [pulsing]);

  return (
    <button
      type="button"
      onClick={() => {
        setPulsing(true);
        onClick();
      }}
      className="rounded-full px-4 py-2 text-sm font-semibold text-white transition"
      style={{
        background: "var(--color-primary)",
        transform: pulsing ? "scale(1.06)" : "scale(1)",
        boxShadow: pulsing
          ? "0 8px 28px color-mix(in srgb, var(--color-primary) 35%, transparent)"
          : "0 6px 18px color-mix(in srgb, var(--color-primary) 18%, transparent)",
      }}
    >
      {label}
    </button>
  );
}

export function PricePill({
  price,
  currency,
  className = "",
}: {
  price: number;
  currency: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${className}`}
      style={{
        background:
          "color-mix(in srgb, var(--color-accent) 28%, white 72%)",
        color: "var(--color-text)",
      }}
    >
      {formatCurrency(price, currency)}
    </span>
  );
}

export function ItemMeta({
  item,
  compact = false,
}: {
  item: MenuItem;
  compact?: boolean;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "text-[11px]" : "text-xs"}`}>
      {item.tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full px-2.5 py-1 font-medium"
          style={{
            background:
              "color-mix(in srgb, var(--color-accent) 22%, white 78%)",
            color: "var(--color-text)",
          }}
        >
          {tag}
        </span>
      ))}
      {item.allergens.length > 0 ? (
        <span
          className="rounded-full px-2.5 py-1 font-medium"
          style={{
            background:
              "color-mix(in srgb, var(--color-primary) 16%, white 84%)",
            color: "var(--color-text)",
          }}
        >
          ⚠ allergens
        </span>
      ) : null}
    </div>
  );
}

export function Description({ text }: { text?: string }) {
  if (!text) {
    return null;
  }

  return <p className="text-sm leading-6 text-black/62">{text}</p>;
}

export function CardSurface({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <article
      className={`overflow-hidden rounded-[calc(var(--radius)+0.35rem)] border border-black/10 bg-white/72 shadow-[0_18px_40px_rgba(0,0,0,0.06)] ${className}`}
      style={style}
    >
      {children}
    </article>
  );
}

export function ItemImage({
  item,
  className = "",
  overlay = false,
}: {
  item: MenuItem;
  className?: string;
  overlay?: boolean;
}) {
  if (!item.image) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 16%, white), color-mix(in srgb, var(--color-accent) 24%, white))",
        }}
      >
        <span className={`${overlay ? "text-white/70" : "text-black/35"} text-xs uppercase tracking-[0.24em]`}>
          No image
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.image}
      alt={item.name}
      className={`object-cover ${className}`}
    />
  );
}
