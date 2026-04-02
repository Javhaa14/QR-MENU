"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { RestaurantListItem, RestaurantPlan } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { createSlugPreview } from "@/lib/slug";
import { getSuperadminContext } from "@/lib/portal";

type RestaurantDraft = {
  name: string;
  slug: string;
  plan: RestaurantPlan;
  isActive: boolean;
};

function createDraft(restaurant: RestaurantListItem): RestaurantDraft {
  return {
    name: restaurant.name,
    slug: restaurant.slug,
    plan: restaurant.plan ?? "free",
    isActive: restaurant.isActive,
  };
}

export default function SuperadminDashboardPage() {
  const [restaurants, setRestaurants] = useState<RestaurantListItem[]>([]);
  const [drafts, setDrafts] = useState<Record<string, RestaurantDraft>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadRestaurants() {
    const context = getSuperadminContext();

    if (!context) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch<RestaurantListItem[]>("/restaurants", {
        token: context.token,
      });
      setRestaurants(response);
      setDrafts((current) => {
        const nextDrafts = { ...current };

        for (const restaurant of response) {
          if (restaurant._id) {
            nextDrafts[restaurant._id] = current[restaurant._id] ?? createDraft(restaurant);
          }
        }

        return nextDrafts;
      });
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load restaurants.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRestaurants();
  }, []);

  function updateDraft(
    restaurantId: string,
    field: keyof RestaurantDraft,
    value: string | boolean,
  ) {
    setDrafts((current) => ({
      ...current,
      [restaurantId]: {
        ...(current[restaurantId] ?? {
          name: "",
          slug: "",
          plan: "free",
          isActive: true,
        }),
        [field]: value,
      },
    }));
  }

  async function saveRestaurant(restaurantId: string) {
    const context = getSuperadminContext();
    const draft = drafts[restaurantId];

    if (!context || !draft) {
      return;
    }

    setSavingId(restaurantId);

    try {
      await apiFetch(`/restaurants/${restaurantId}`, {
        token: context.token,
        method: "PATCH",
        body: draft,
      });

      setEditingId(null);
      await loadRestaurants();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save restaurant changes.",
      );
    } finally {
      setSavingId(null);
    }
  }

  async function toggleActivation(restaurant: RestaurantListItem) {
    if (!restaurant._id) {
      return;
    }

    const context = getSuperadminContext();

    if (!context) {
      return;
    }

    setSavingId(restaurant._id);

    try {
      await apiFetch(`/restaurants/${restaurant._id}`, {
        token: context.token,
        method: "PATCH",
        body: {
          isActive: !restaurant.isActive,
        },
      });

      await loadRestaurants();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update restaurant status.",
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="grid gap-6">
      <header className="overflow-hidden rounded-[2rem] border border-black/10 bg-[#f8f1e7] p-6 shadow-velvet">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-black/45">
              Superadmin Dashboard
            </p>
            <h1 className="mt-3 font-display text-5xl text-[#231810]">
              Restaurant control plane
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-black/60">
              Manage tenant setup, keep each restaurant active or paused, and
              jump straight into menus, staff, themes, or QR operations.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.3rem] border border-black/10 bg-white/70 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">
                Restaurants
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#231810]">
                {restaurants.length}
              </p>
            </div>
            <div className="rounded-[1.3rem] border border-black/10 bg-white/70 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-black/45">
                Active
              </p>
              <p className="mt-2 text-3xl font-semibold text-[#231810]">
                {restaurants.filter((restaurant) => restaurant.isActive).length}
              </p>
            </div>
            <Link
              href="/superadmin/restaurants/new"
              className="grid place-items-center rounded-[1.3rem] bg-[#231810] px-5 py-4 text-sm font-semibold text-white"
            >
              Create restaurant
            </Link>
          </div>
        </div>
      </header>

      {error ? (
        <div className="rounded-[1.4rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/70 shadow-velvet">
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-[#f6eee4] text-left text-xs uppercase tracking-[0.2em] text-black/45">
                <th className="px-5 py-4 font-medium">Restaurant</th>
                <th className="px-5 py-4 font-medium">Slug</th>
                <th className="px-5 py-4 font-medium">Plan</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Orders today</th>
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant) => {
                const restaurantId = restaurant._id ?? "";
                const draft = drafts[restaurantId] ?? createDraft(restaurant);
                const isEditing = editingId === restaurantId;
                const isSaving = savingId === restaurantId;

                return (
                  <tr key={restaurantId} className="border-b border-black/8 align-top">
                    <td className="px-5 py-5">
                      {isEditing ? (
                        <input
                          value={draft.name}
                          onChange={(event) =>
                            updateDraft(restaurantId, "name", event.target.value)
                          }
                          className="w-full rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                        />
                      ) : (
                        <div>
                          <p className="font-medium text-[#231810]">{restaurant.name}</p>
                          <p className="mt-1 text-xs text-black/45">
                            Created {restaurant.createdAt?.slice(0, 10) ?? "recently"}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-5">
                      {isEditing ? (
                        <div className="grid gap-2">
                          <input
                            value={draft.slug}
                            onChange={(event) =>
                              updateDraft(
                                restaurantId,
                                "slug",
                                createSlugPreview(event.target.value),
                              )
                            }
                            className="w-full rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                          />
                          <p className="text-xs text-black/45">
                            URL: /menu/{draft.slug}
                          </p>
                        </div>
                      ) : (
                        <code className="text-sm text-black/60">{restaurant.slug}</code>
                      )}
                    </td>
                    <td className="px-5 py-5">
                      {isEditing ? (
                        <select
                          value={draft.plan}
                          onChange={(event) =>
                            updateDraft(
                              restaurantId,
                              "plan",
                              event.target.value as RestaurantPlan,
                            )
                          }
                          className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                        </select>
                      ) : (
                        <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/60">
                          {restaurant.plan ?? "free"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-5">
                      {isEditing ? (
                        <label className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 text-sm text-black/65">
                          <input
                            type="checkbox"
                            checked={draft.isActive}
                            onChange={(event) =>
                              updateDraft(
                                restaurantId,
                                "isActive",
                                event.target.checked,
                              )
                            }
                          />
                          Active
                        </label>
                      ) : (
                        <span
                          className="rounded-full px-3 py-1 text-xs"
                          style={{
                            background: restaurant.isActive
                              ? "rgba(34, 197, 94, 0.1)"
                              : "rgba(239, 68, 68, 0.1)",
                            color: restaurant.isActive ? "#166534" : "#991b1b",
                          }}
                        >
                          {restaurant.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-5 text-sm text-[#231810]">
                      {restaurant.ordersToday}
                    </td>
                    <td className="px-5 py-5">
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void saveRestaurant(restaurantId)}
                              disabled={isSaving}
                              className="rounded-full bg-[#231810] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setDrafts((current) => ({
                                  ...current,
                                  [restaurantId]: createDraft(restaurant),
                                }));
                              }}
                              className="rounded-full border border-black/10 px-4 py-2 text-xs text-black/65"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setDrafts((current) => ({
                                ...current,
                                [restaurantId]: createDraft(restaurant),
                              }));
                              setEditingId(restaurantId);
                            }}
                            className="rounded-full border border-black/10 px-4 py-2 text-xs text-black/65"
                          >
                            Edit
                          </button>
                        )}

                        <Link
                          href={`/superadmin/restaurants/${restaurantId}/menu`}
                          className="rounded-full border border-black/10 px-4 py-2 text-xs text-black/65"
                        >
                          Manage Menu
                        </Link>
                        <Link
                          href={`/superadmin/restaurants/${restaurantId}/theme`}
                          className="rounded-full border border-black/10 px-4 py-2 text-xs text-black/65"
                        >
                          Theme
                        </Link>
                        <Link
                          href={`/superadmin/restaurants/${restaurantId}/staff`}
                          className="rounded-full border border-black/10 px-4 py-2 text-xs text-black/65"
                        >
                          Staff
                        </Link>
                        <Link
                          href={`/superadmin/restaurants/${restaurantId}/qr`}
                          className="rounded-full border border-black/10 px-4 py-2 text-xs text-black/65"
                        >
                          QR
                        </Link>
                        <button
                          type="button"
                          onClick={() => void toggleActivation(restaurant)}
                          disabled={isSaving}
                          className="rounded-full border border-black/10 px-4 py-2 text-xs text-black/65 disabled:opacity-60"
                        >
                          {restaurant.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!loading && restaurants.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-black/55">
            No restaurants yet. Create the first one to start building menus and
            staff accounts.
          </div>
        ) : null}
      </section>
    </section>
  );
}
