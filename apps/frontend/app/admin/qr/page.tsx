"use client";

import { useEffect, useMemo, useState } from "react";

import type { Restaurant } from "@qr-menu/shared-types";

import { apiFetch, clientApiUrl } from "@/lib/api";
import { DEFAULT_QR_TABLES, getRestaurantAdminContext } from "@/lib/portal";

function downloadImage(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

export default function AdminQrPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables] = useState<string[]>(DEFAULT_QR_TABLES);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const context = getRestaurantAdminContext();

    if (!context) {
      return;
    }

    void apiFetch<Restaurant>("/restaurants/me", { token: context.token })
      .then((response) => {
        setRestaurant(response);
        setError(null);
      })
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load QR codes.",
        );
      });
  }, []);

  const baseQrUrl = useMemo(() => {
    return restaurant?.slug
      ? `${clientApiUrl}/public/qr/${restaurant.slug}`
      : null;
  }, [restaurant?.slug]);

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(104,180,154,0.18),transparent_32%),linear-gradient(135deg,#173233,#102021)] p-6 text-white shadow-velvet">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">
          QR Codes
        </p>
        <h1 className="mt-3 font-display text-5xl">
          Download and place
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68">
          Print-ready QR codes for the current restaurant only. This view never
          exposes any other tenant or editing controls.
        </p>
      </header>

      {error ? (
        <div className="rounded-[1.4rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {restaurant && baseQrUrl ? (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-[1.7rem] border border-white/8 bg-white/90 p-6 shadow-velvet">
            <p className="text-xs uppercase tracking-[0.24em] text-black/45">
              Main menu QR
            </p>
            <div className="mt-5 grid gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={baseQrUrl}
                alt="Restaurant QR"
                className="mx-auto aspect-square w-full max-w-xs rounded-[1.5rem] border border-black/10 bg-white p-4"
              />
              <button
                type="button"
                onClick={() =>
                  downloadImage(baseQrUrl, `${restaurant.slug}-menu-qr.png`)
                }
                className="rounded-full bg-[#231810] px-5 py-3 text-sm font-semibold text-white"
              >
                Download main QR
              </button>
            </div>
          </section>

          <section className="rounded-[1.7rem] border border-white/8 bg-[#132426] p-6 text-white shadow-velvet">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                  Table codes
                </p>
                <h2 className="mt-2 font-display text-3xl">Per-table QR set</h2>
              </div>
              <p className="text-sm text-white/55">
                Fixed set for download-only staff use
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {tables.map((table) => {
                const url = `${clientApiUrl}/public/qr/${restaurant.slug}/table/${table}`;
                return (
                  <article
                    key={table}
                    className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`QR for table ${table}`}
                      className="aspect-square w-full rounded-[1rem] bg-white p-3"
                    />
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                          Table
                        </p>
                        <p className="text-lg font-semibold">{table}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          downloadImage(url, `${restaurant.slug}-table-${table}.png`)
                        }
                        className="rounded-full border border-white/10 px-4 py-2 text-sm"
                      >
                        Download
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
