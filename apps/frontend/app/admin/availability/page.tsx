"use client";

import { useEffect, useMemo, useState } from "react";

import type { Menu, Restaurant } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { getRestaurantAdminContext } from "@/lib/portal";

export default function AdminAvailabilityPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingItemId, setSavingItemId] = useState<string | null>(null);

  async function load() {
    const context = getRestaurantAdminContext();

    if (!context) {
      return;
    }

    try {
      const [restaurantResponse, menuResponse] = await Promise.all([
        apiFetch<Restaurant>("/restaurants/me", { token: context.token }),
        apiFetch<Menu[]>(`/restaurants/${context.restaurantId}/menus`, {
          token: context.token,
        }),
      ]);

      setRestaurant(restaurantResponse);
      setMenu(menuResponse[0] ?? null);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Харагдацын удирдлагыг ачаалж чадсангүй.",
      );
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const totalItems = useMemo(
    () => menu?.categories.reduce((count, category) => count + category.items.length, 0) ?? 0,
    [menu],
  );

  async function toggleAvailability(categoryId: string, itemId?: string) {
    const context = getRestaurantAdminContext();

    if (!context || !menu?._id || !itemId) {
      return;
    }

    setSavingItemId(itemId);

    try {
      const updatedMenu = await apiFetch<Menu>(
        `/restaurants/${context.restaurantId}/menus/${menu._id}/categories/${categoryId}/items/${itemId}/toggle`,
        {
          token: context.token,
          method: "PATCH",
        },
      );

      setMenu(updatedMenu);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Хоолны харагдацыг шинэчилж чадсангүй.",
      );
    } finally {
      setSavingItemId(null);
    }
  }

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)]">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          Бэлэн байдал
        </p>
        <h1 className="mt-3 font-display text-5xl text-black">
          {restaurant?.name ?? "Ресторан"} хоолнуудын харагдац
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60">
          {restaurant?.restaurantType === "menu_only"
            ? "Эндээс хоолнуудыг зочинд харагдах эсэхийг хурдан асааж, унтраана. Бүтэн засварыг Меню студи дээр хийнэ."
            : "Энд зөвхөн яг одоо захиалж болох эсэхийг удирдана. Нэр, үнэ, бүтэц нь супер админ хэсэгт хадгалагдана."}
        </p>
      </header>

      {error ? (
        <div className="rounded-[1.4rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {menu ? (
        <div className="grid gap-4">
          <section className="rounded-[1.7rem] border border-black/10 bg-white p-5 text-black shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-black/45">
                  Меню
                </p>
                <h2 className="mt-2 font-display text-3xl">Зочинд харагдах хоолнууд</h2>
              </div>
              <div className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/68">
                {menu.categories.length} ангилал • {totalItems} хоол
              </div>
            </div>
          </section>

          {menu.categories.map((category) => (
            <section
              key={category._id}
              className="rounded-[1.7rem] border border-black/10 bg-white p-5 text-black shadow-[0_12px_30px_rgba(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-black/45">
                    Ангилал
                  </p>
                  <h2 className="mt-2 font-display text-3xl">{category.name}</h2>
                </div>
                <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">
                  {category.items.length} хоол
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {category.items.map((item) => (
                  <article
                    key={item._id}
                    className="grid gap-3 rounded-[1.2rem] border border-black/10 bg-[#fafafa] p-4 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-medium">{item.name}</h3>
                        <span
                          className="rounded-full px-3 py-1 text-[11px]"
                          style={{
                            background: item.isAvailable
                              ? "rgba(17,17,17,0.08)"
                              : "rgba(17,17,17,0.04)",
                            color: item.isAvailable ? "#111111" : "rgba(17,17,17,0.58)",
                          }}
                        >
                          {item.isAvailable ? "Зочинд харагдаж байна" : "Зочдоос нуугдсан"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-black/60">
                        {item.description || "Тайлбар алга"}
                      </p>
                      <p className="mt-3 text-sm text-black/72">
                        {formatCurrency(item.price, item.currency)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void toggleAvailability(category._id ?? "", item._id)
                      }
                      disabled={savingItemId === item._id}
                      className="rounded-full bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
                    >
                      {savingItemId === item._id
                        ? "Хадгалж байна..."
                        : item.isAvailable
                          ? "Нуух"
                          : "Харагдуулах"}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.7rem] border border-dashed border-black/10 bg-white px-6 py-16 text-center text-sm text-black/55">
          Бэлэн байдлыг удирдах меню одоогоор алга байна.
        </div>
      )}
    </section>
  );
}
