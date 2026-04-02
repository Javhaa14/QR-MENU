"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { Menu, Restaurant, SlotName, ThemeConfig } from "@qr-menu/shared-types";

import { MenuRenderer } from "@/components/menu/MenuRenderer";
import { apiFetch } from "@/lib/api";
import { getSlotVariants } from "@/lib/componentRegistry";
import {
  DEFAULT_THEME,
  FONT_OPTIONS,
  SLOT_LABELS,
  sanitizeThemeConfig,
} from "@/lib/theme";
import { getSuperadminContext } from "@/lib/portal";

export default function RestaurantThemePage() {
  const params = useParams<{ id: string }>();
  const restaurantId = String(params.id ?? "");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) {
      return;
    }

    async function load() {
      const context = getSuperadminContext();

      if (!context) {
        return;
      }

      const [restaurantResponse, menuResponse] = await Promise.all([
        apiFetch<Restaurant>(`/restaurants/${restaurantId}`, {
          token: context.token,
        }),
        apiFetch<Menu[]>(`/restaurants/${restaurantId}/menus`, {
          token: context.token,
        }),
      ]);

      setRestaurant({
        ...restaurantResponse,
        themeConfig: sanitizeThemeConfig(restaurantResponse.themeConfig),
      });
      setMenus(menuResponse);
      setTheme(sanitizeThemeConfig(restaurantResponse.themeConfig));

      const nextPreviewMenu =
        menuResponse.find((entry) => entry.isActive)?._id ??
        menuResponse[0]?._id ??
        null;
      setSelectedMenuId(nextPreviewMenu);
    }

    void load().catch((requestError) => {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load theme editor.",
      );
    });
  }, [restaurantId]);

  const previewRestaurant = useMemo(() => {
    return restaurant ? { ...restaurant, themeConfig: theme } : null;
  }, [restaurant, theme]);

  const previewMenu = useMemo(() => {
    return (
      menus.find((menu) => menu._id === selectedMenuId) ??
      menus.find((menu) => menu.isActive) ??
      menus[0] ??
      null
    );
  }, [menus, selectedMenuId]);

  async function saveTheme() {
    const context = getSuperadminContext();

    if (!context) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedRestaurant = await apiFetch<Restaurant>(
        `/restaurants/${restaurantId}/theme`,
        {
          token: context.token,
          method: "PATCH",
          body: sanitizeThemeConfig(theme),
        },
      );

      const nextTheme = sanitizeThemeConfig(updatedRestaurant.themeConfig);
      setRestaurant({
        ...updatedRestaurant,
        themeConfig: nextTheme,
      });
      setTheme(nextTheme);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save theme.",
      );
    } finally {
      setSaving(false);
    }
  }

  function setSlotVariant(slot: SlotName, variant: string) {
    setTheme((current) => ({
      ...current,
      components: {
        ...current.components,
        [slot]: variant,
      },
    }));
  }

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-black/10 bg-[#f8f1e7] p-6 shadow-velvet">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          Theme Editor
        </p>
        <h1 className="mt-3 font-display text-5xl text-[#231810]">
          {restaurant?.name ?? "Restaurant"} theme system
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-black/60">
          Tune colors, typography, radius, and slot variants while previewing the
          exact public menu composition before you save.
        </p>
      </header>

      {error ? (
        <div className="rounded-[1.4rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 2xl:grid-cols-[0.92fr_1.08fr]">
        <section className="grid gap-6">
          <div className="rounded-[1.7rem] border border-black/10 bg-white/75 p-6 shadow-velvet">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-black/45">
                  Design tokens
                </p>
                <h2 className="mt-2 font-display text-3xl text-[#231810]">
                  Visual system
                </h2>
              </div>

              <button
                type="button"
                onClick={() => void saveTheme()}
                disabled={saving}
                className="rounded-full bg-[#231810] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save theme"}
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {(
                [
                  ["primary", theme.colors.primary],
                  ["bg", theme.colors.bg],
                  ["text", theme.colors.text],
                  ["accent", theme.colors.accent],
                ] as const
              ).map(([key, value]) => (
                <label key={key} className="grid gap-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-black/45">
                    {key}
                  </span>
                  <input
                    type="color"
                    value={value}
                    onChange={(event) =>
                      setTheme((current) => ({
                        ...current,
                        colors: {
                          ...current.colors,
                          [key]: event.target.value,
                        },
                      }))
                    }
                    className="h-12 w-full rounded-[1rem] border border-black/10 bg-white"
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-black/45">
                  Display font
                </span>
                <select
                  value={theme.font}
                  onChange={(event) =>
                    setTheme((current) => ({ ...current, font: event.target.value }))
                  }
                  className="rounded-[1rem] border border-black/10 bg-white px-4 py-3 outline-none"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-black/45">
                  Radius
                </span>
                <select
                  value={theme.borderRadius}
                  onChange={(event) =>
                    setTheme((current) => ({
                      ...current,
                      borderRadius: event.target.value as ThemeConfig["borderRadius"],
                    }))
                  }
                  className="rounded-[1rem] border border-black/10 bg-white px-4 py-3 outline-none"
                >
                  {["none", "sm", "md", "lg", "full"].map((radius) => (
                    <option key={radius} value={radius}>
                      {radius}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="inline-flex items-center gap-3 rounded-[1rem] border border-black/10 bg-[#faf5ef] px-4 py-3 text-sm text-black/65">
                <input
                  type="checkbox"
                  checked={theme.showImages ?? true}
                  onChange={(event) =>
                    setTheme((current) => ({
                      ...current,
                      showImages: event.target.checked,
                    }))
                  }
                />
                Show menu imagery
              </label>

              <label className="inline-flex items-center gap-3 rounded-[1rem] border border-black/10 bg-[#faf5ef] px-4 py-3 text-sm text-black/65">
                <input
                  type="checkbox"
                  checked={theme.darkMode ?? false}
                  onChange={(event) =>
                    setTheme((current) => ({
                      ...current,
                      darkMode: event.target.checked,
                    }))
                  }
                />
                Dark mode flag
              </label>
            </div>

            <label className="mt-5 grid gap-2">
              <span className="text-xs uppercase tracking-[0.2em] text-black/45">
                Hero image URL
              </span>
              <input
                value={theme.heroImage ?? ""}
                onChange={(event) =>
                  setTheme((current) => ({
                    ...current,
                    heroImage: event.target.value,
                  }))
                }
                placeholder="https://..."
                className="rounded-[1rem] border border-black/10 bg-white px-4 py-3 outline-none"
              />
            </label>
          </div>

          <div className="rounded-[1.7rem] border border-black/10 bg-[#231810] p-6 text-white shadow-velvet">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">
              Component registry
            </p>
            <div className="mt-5 grid gap-5">
              {(Object.keys(SLOT_LABELS) as SlotName[]).map((slot) => (
                <div
                  key={slot}
                  className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-sm font-medium">{SLOT_LABELS[slot]}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getSlotVariants(slot).map((variant) => {
                      const active = theme.components[slot] === variant;

                      return (
                        <button
                          key={variant}
                          type="button"
                          onClick={() => setSlotVariant(slot, variant)}
                          className="rounded-full px-4 py-2 text-sm"
                          style={{
                            background: active ? "white" : "rgba(255,255,255,0.08)",
                            color: active ? "#231810" : "white",
                          }}
                        >
                          {variant}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[1.7rem] border border-black/10 bg-white/75 p-4 shadow-velvet">
          <div className="flex flex-col gap-3 px-3 pt-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-black/45">
                Live preview
              </p>
              <p className="mt-2 text-sm text-black/55">
                Previewing {previewMenu?.name ?? "no menu selected"}
              </p>
            </div>

            {menus.length > 0 ? (
              <select
                value={selectedMenuId ?? ""}
                onChange={(event) => setSelectedMenuId(event.target.value)}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm outline-none"
              >
                {menus.map((menu) => (
                  <option key={menu._id} value={menu._id}>
                    {menu.name}
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          <div className="mt-3 max-h-[80vh] overflow-auto rounded-[1.5rem] border border-black/10 bg-white/55">
            {previewRestaurant && previewMenu ? (
              <MenuRenderer
                restaurant={previewRestaurant}
                menu={previewMenu}
                onAdd={() => {}}
              />
            ) : (
              <div className="px-6 py-12 text-sm text-black/55">
                Create a menu first to unlock the live theme preview.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
