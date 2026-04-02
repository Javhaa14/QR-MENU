"use client";

import { useEffect, useMemo, useState } from "react";

import type { PublicMenuResponse, Restaurant, SlotName, ThemeConfig } from "@qr-menu/shared-types";

import { MenuRenderer } from "@/components/menu/MenuRenderer";
import { apiFetch } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import { getSlotVariants } from "@/lib/componentRegistry";
import { DEFAULT_THEME, FONT_OPTIONS, SLOT_LABELS } from "@/lib/theme";

export default function AdminThemePage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuData, setMenuData] = useState<PublicMenuResponse | null>(null);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    async function load() {
      const restaurantResponse = await apiFetch<Restaurant>("/restaurant/me", {
        token,
      });
      setRestaurant(restaurantResponse);
      setTheme(restaurantResponse.themeConfig);

      const menuResponse = await apiFetch<PublicMenuResponse>(
        `/public/menu/${restaurantResponse.slug}`,
      );
      setMenuData(menuResponse);
    }

    load().catch((requestError) => {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load theme editor.",
      );
    });
  }, []);

  const previewRestaurant = useMemo(() => {
    return restaurant ? { ...restaurant, themeConfig: theme } : null;
  }, [restaurant, theme]);

  async function saveTheme() {
    const token = getStoredToken();
    if (!token) return;

    setSaving(true);
    setError(null);

    try {
      const updatedRestaurant = await apiFetch<Restaurant>("/restaurant/me/theme", {
        token,
        method: "PATCH",
        body: theme,
      });

      setRestaurant(updatedRestaurant);
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
      <header className="rounded-[2rem] border border-black/10 bg-white/65 p-6 shadow-velvet">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          Theme editor
        </p>
        <h1 className="mt-3 font-display text-5xl text-[#231810]">
          Tune the visual identity
        </h1>
      </header>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/8 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
        <section className="grid gap-6">
          <div className="rounded-[1.7rem] border border-black/10 bg-white/65 p-6">
            <h2 className="font-display text-3xl text-[#231810]">Tokens</h2>
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
                  className="rounded-[1rem] border border-black/10 bg-white/80 px-4 py-3 outline-none"
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
                  className="rounded-[1rem] border border-black/10 bg-white/80 px-4 py-3 outline-none"
                >
                  {["none", "sm", "md", "lg", "full"].map((radius) => (
                    <option key={radius} value={radius}>
                      {radius}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-black/10 bg-[#16120f] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                  Registry
                </p>
                <h2 className="mt-2 font-display text-3xl">Swap slot variants</h2>
              </div>
              <button
                type="button"
                onClick={() => void saveTheme()}
                disabled={saving}
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#231810] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save theme"}
              </button>
            </div>

            <div className="mt-5 grid gap-5">
              {(Object.keys(SLOT_LABELS) as SlotName[]).map((slot) => (
                <div key={slot} className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
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

        <section className="rounded-[1.7rem] border border-black/10 bg-white/65 p-4">
          <p className="px-3 pt-2 text-xs uppercase tracking-[0.24em] text-black/45">
            Live preview
          </p>
          <div className="mt-3 max-h-[80vh] overflow-auto rounded-[1.5rem] border border-black/10 bg-white/50">
            {previewRestaurant && menuData ? (
              <MenuRenderer
                restaurant={previewRestaurant}
                menu={menuData.menu}
                onAdd={() => {}}
              />
            ) : (
              <div className="px-6 py-10 text-sm text-black/55">
                Loading preview...
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
