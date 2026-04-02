"use client";

import { useEffect, useMemo, useState } from "react";

import type { Restaurant } from "@qr-menu/shared-types";

import { apiFetch, clientApiUrl } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";

function downloadImage(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

export default function AdminQrPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<string[]>(["1", "2", "3", "4", "5", "6"]);
  const [newTable, setNewTable] = useState("");

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    void apiFetch<Restaurant>("/restaurant/me", { token }).then(setRestaurant);
  }, []);

  const baseQrUrl = useMemo(() => {
    return restaurant?.slug
      ? `${clientApiUrl}/public/qr/${restaurant.slug}`
      : null;
  }, [restaurant?.slug]);

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-black/10 bg-white/65 p-6 shadow-velvet">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          QR Codes
        </p>
        <h1 className="mt-3 font-display text-5xl text-[#231810]">
          Download and place
        </h1>
      </header>

      {restaurant && baseQrUrl ? (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-[1.7rem] border border-black/10 bg-white/65 p-6">
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

          <section className="rounded-[1.7rem] border border-black/10 bg-[#16120f] p-6 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                  Table codes
                </p>
                <h2 className="mt-2 font-display text-3xl">Per-table QR set</h2>
              </div>
              <div className="flex gap-2">
                <input
                  value={newTable}
                  onChange={(event) => setNewTable(event.target.value)}
                  placeholder="Table number"
                  className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white outline-none placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newTable.trim()) return;
                    setTables((current) => Array.from(new Set([...current, newTable])));
                    setNewTable("");
                  }}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm"
                >
                  Add
                </button>
              </div>
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
