"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type { Menu, Order, Restaurant } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/providers/CartProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";

export function CartPageClient({
  restaurant,
  menu,
  slug,
  initialTableNumber,
}: {
  restaurant: Restaurant;
  menu: Menu;
  slug: string;
  initialTableNumber?: string;
}) {
  const {
    items,
    totalPrice,
    tableNumber,
    setTableNumber,
    updateNote,
    updateQuantity,
    clearCart,
  } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (initialTableNumber && !tableNumber) {
      setTableNumber(initialTableNumber);
    }
  }, [initialTableNumber, setTableNumber, tableNumber]);

  const lineCount = useMemo(
    () => items.reduce((sum, entry) => sum + entry.quantity, 0),
    [items],
  );

  async function placeOrder() {
    if (items.length === 0) {
      setError("Сагс хоосон байна.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const order = await apiFetch<Order>("/public/orders", {
        method: "POST",
        body: {
          restaurantId: restaurant._id,
          tableNumber,
          items: items.map((entry) => ({
            menuItemId: entry.item._id,
            name: entry.item.name,
            price: entry.item.price,
            quantity: entry.quantity,
            note: entry.note,
          })),
        },
      });

      setOrderId(order._id ?? null);
      clearCart();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Захиалга илгээж чадсангүй.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (orderId) {
    return (
      <ThemeProvider config={restaurant.themeConfig}>
        <main className="min-h-screen px-4 py-8 md:px-6">
          <div className="mx-auto grid max-w-2xl gap-6 rounded-[calc(var(--radius)+1rem)] border border-black/10 bg-white/70 p-8 text-center shadow-velvet">
            <p className="text-xs uppercase tracking-[0.24em] text-black/45">
              Захиалга баталгаажлаа
            </p>
            <h1 className="font-display text-4xl text-ink">Баярлалаа.</h1>
            <p className="text-sm leading-7 text-black/60">
              Таны захиалга {restaurant.name} рестораны гал тогоо руу илгээгдлээ.
            </p>
            <div className="rounded-[calc(var(--radius)+0.25rem)] border border-black/10 bg-black/[0.04] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-black/45">
                Захиалгын дугаар
              </p>
              <p className="mt-2 text-lg font-semibold text-ink">{orderId}</p>
            </div>
            <Link
              href={`/menu/${slug}`}
              className="mx-auto rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white"
            >
              Меню рүү буцах
            </Link>
          </div>
        </main>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider config={restaurant.themeConfig}>
      <main className="min-h-screen px-4 py-8 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[calc(var(--radius)+1rem)] border border-black/10 bg-white/70 p-6 shadow-velvet">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-black/45">
                  Захиалга шалгах
                </p>
                <h1 className="mt-2 font-display text-4xl text-ink">
                  Таны сагс
                </h1>
              </div>
              <Link
                href={`/menu/${slug}`}
                className="text-sm font-medium text-[var(--color-primary)]"
              >
                Меню рүү буцах
              </Link>
            </div>

            <div className="grid gap-4">
              {items.length === 0 ? (
                <div className="rounded-[calc(var(--radius)+0.2rem)] border border-dashed border-black/10 px-5 py-10 text-center text-sm text-black/55">
                  Сагс хоосон байна. Эхлээд менюгээс хоол нэмнэ үү.
                </div>
              ) : (
                items.map((entry) => (
                  <article
                    key={entry.item._id}
                    className="rounded-[calc(var(--radius)+0.2rem)] border border-black/10 bg-white/60 p-4"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <h2 className="font-medium text-ink">{entry.item.name}</h2>
                        <p className="text-sm text-black/55">
                          {formatCurrency(entry.item.price, entry.item.currency)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(entry.item._id ?? "", entry.quantity - 1)
                          }
                          className="h-9 w-9 rounded-full border border-black/10 bg-white/70"
                        >
                          -
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold">
                          {entry.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(entry.item._id ?? "", entry.quantity + 1)
                          }
                          className="h-9 w-9 rounded-full border border-black/10 bg-white/70"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <label className="mt-4 grid gap-2">
                      <span className="text-xs uppercase tracking-[0.2em] text-black/45">
                        Тайлбар
                      </span>
                      <input
                        value={entry.note}
                        onChange={(event) =>
                          updateNote(entry.item._id ?? "", event.target.value)
                        }
                        placeholder="Сонгиногүй, илүү халуун..."
                        className="rounded-[calc(var(--radius)-0.1rem)] border border-black/10 bg-white/75 px-4 py-3 text-sm outline-none"
                      />
                    </label>
                  </article>
                ))
              )}
            </div>
          </section>

          <aside className="h-fit rounded-[calc(var(--radius)+1rem)] border border-black/10 bg-black/85 p-6 text-white shadow-velvet">
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/55">
                  Дүгнэлт
                </p>
                <h2 className="mt-2 font-display text-3xl">Захиалга илгээх</h2>
              </div>
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.24em] text-white/55">
                  Ширээний дугаар
                </span>
                <input
                  value={tableNumber}
                  onChange={(event) => setTableNumber(event.target.value)}
                  placeholder="Хэрэв байгаа бол"
                  className="rounded-[calc(var(--radius)-0.1rem)] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/45"
                />
              </label>
              <div className="rounded-[calc(var(--radius)+0.1rem)] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Бүтээгдэхүүн</span>
                  <span>{lineCount}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-base font-semibold">
                  <span>Нийт</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
              {error ? (
                <div className="rounded-[calc(var(--radius)-0.1rem)] border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}
              <button
                type="button"
                onClick={placeOrder}
                disabled={submitting || items.length === 0 || !restaurant._id}
                className="w-full rounded-full px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-55"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-accent) 68%, var(--color-primary) 32%))",
                }}
              >
                {submitting ? "Захиалга илгээж байна..." : "Захиалга илгээх"}
              </button>
              <div className="rounded-[calc(var(--radius)-0.1rem)] border border-white/10 bg-white/5 px-4 py-3 text-xs leading-6 text-white/55">
                Захиалга илгээхэд бэлэн боллоо.
              </div>
            </div>
          </aside>
        </div>
      </main>
    </ThemeProvider>
  );
}
