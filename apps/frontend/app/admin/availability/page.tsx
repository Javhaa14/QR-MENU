"use client";

import { useEffect, useMemo, useState } from "react";

import type { Menu, Restaurant } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { getRestaurantAdminContext } from "@/lib/portal";

export default function AdminAvailabilityPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
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
      setMenus(menuResponse);
      setSelectedMenuId((current) => {
        if (current && menuResponse.some((menu) => menu._id === current)) {
          return current;
        }

        return menuResponse.find((menu) => menu.isActive)?._id ?? menuResponse[0]?._id ?? null;
      });
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load availability controls.",
      );
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const selectedMenu = useMemo(
    () => menus.find((menu) => menu._id === selectedMenuId) ?? null,
    [menus, selectedMenuId],
  );

  async function toggleAvailability(categoryId: string, itemId?: string) {
    const context = getRestaurantAdminContext();

    if (!context || !selectedMenu?._id || !itemId) {
      return;
    }

    setSavingItemId(itemId);

    try {
      await apiFetch(
        `/restaurants/${context.restaurantId}/menus/${selectedMenu._id}/categories/${categoryId}/items/${itemId}/toggle`,
        {
          token: context.token,
          method: "PATCH",
        },
      );

      await load();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update item availability.",
      );
    } finally {
      setSavingItemId(null);
    }
  }

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(104,180,154,0.18),transparent_32%),linear-gradient(135deg,#173233,#102021)] p-6 text-white shadow-velvet">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">
          Availability
        </p>
        <h1 className="mt-3 font-display text-5xl">
          {restaurant?.name ?? "Restaurant"} item availability
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
          This staff portal only controls what can be ordered right now. Names,
          pricing, and menu structure stay locked to the superadmin workspace.
        </p>
      </header>

      {error ? (
        <div className="rounded-[1.4rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {menus.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {menus.map((menu) => {
            const active = menu._id === selectedMenuId;

            return (
              <button
                key={menu._id}
                type="button"
                onClick={() => setSelectedMenuId(menu._id ?? null)}
                className="rounded-full px-4 py-2 text-sm"
                style={{
                  background: active ? "rgba(104,180,154,0.2)" : "rgba(255,255,255,0.05)",
                  color: active ? "#f5f5ef" : "rgba(245,245,239,0.75)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {menu.name}
                {menu.isActive ? " • Active" : ""}
              </button>
            );
          })}
        </div>
      ) : null}

      {selectedMenu ? (
        <div className="grid gap-4">
          {selectedMenu.categories.map((category) => (
            <section
              key={category._id}
              className="rounded-[1.7rem] border border-white/8 bg-white/5 p-5 text-white shadow-velvet"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                    Category
                  </p>
                  <h2 className="mt-2 font-display text-3xl">{category.name}</h2>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
                  {category.items.length} items
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {category.items.map((item) => (
                  <article
                    key={item._id}
                    className="grid gap-3 rounded-[1.2rem] border border-white/8 bg-[#132426] p-4 md:grid-cols-[1fr_auto]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-medium">{item.name}</h3>
                        <span
                          className="rounded-full px-3 py-1 text-[11px]"
                          style={{
                            background: item.isAvailable
                              ? "rgba(34,197,94,0.16)"
                              : "rgba(239,68,68,0.16)",
                            color: item.isAvailable ? "#bbf7d0" : "#fecaca",
                          }}
                        >
                          {item.isAvailable ? "Available" : "Hidden from guests"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/60">
                        {item.description || "No description"}
                      </p>
                      <p className="mt-3 text-sm text-white/72">
                        {formatCurrency(item.price, item.currency)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void toggleAvailability(category._id ?? "", item._id)
                      }
                      disabled={savingItemId === item._id}
                      className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/75 disabled:opacity-60"
                    >
                      {savingItemId === item._id
                        ? "Saving..."
                        : item.isAvailable
                          ? "Disable"
                          : "Enable"}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.7rem] border border-dashed border-white/10 bg-white/5 px-6 py-16 text-center text-sm text-white/55">
          No menu is available for availability controls yet.
        </div>
      )}
    </section>
  );
}
