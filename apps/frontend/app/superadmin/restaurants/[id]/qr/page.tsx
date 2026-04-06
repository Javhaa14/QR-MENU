"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { Restaurant } from "@qr-menu/shared-types";

import { apiFetch, clientApiUrl } from "@/lib/api";
import { getSuperadminContext, sortTableValues } from "@/lib/portal";

function downloadImage(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}

function normalizeTable(value: string) {
  return value.trim();
}

export default function RestaurantQrPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = String(params.id ?? "");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [newTable, setNewTable] = useState("");
  const [savingTables, setSavingTables] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadRestaurant() {
    const context = getSuperadminContext();

    if (!context || !restaurantId) {
      return;
    }

    try {
      const response = await apiFetch<Restaurant>(`/restaurants/${restaurantId}`, {
        token: context.token,
      });
      setRestaurant(response);
      setTables(sortTableValues(response.tables ?? []));
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Рестораны QR мэдээллийг ачаалж чадсангүй.",
      );
    }
  }

  useEffect(() => {
    void loadRestaurant();
  }, [restaurantId]);

  async function saveTables(nextTables: string[]) {
    const context = getSuperadminContext();

    if (!context || !restaurantId || !restaurant) {
      return;
    }

    setSavingTables(true);

    try {
      const response = await apiFetch<Restaurant>(
        `/restaurants/${restaurantId}/tables`,
        {
          token: context.token,
          method: "PATCH",
          body: {
            tables: nextTables,
          },
        },
      );

      setRestaurant(response);
      setTables(sortTableValues(response.tables ?? []));
      setNewTable("");
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ширээний мэдээллийг шинэчилж чадсангүй.",
      );
    } finally {
      setSavingTables(false);
    }
  }

  const baseQrUrl = useMemo(() => {
    return restaurant?.slug
      ? `${clientApiUrl}/public/qr/${restaurant.slug}`
      : null;
  }, [restaurant?.slug]);

  const isOrderEnabled = restaurant?.restaurantType === "order_enabled";

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)]">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          QR код
        </p>
        <h1 className="mt-3 font-display text-5xl text-[#231810]">
          {restaurant?.name ?? "Ресторан"} QR кодууд
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60">
          Нэг нийтийн QR үргэлж байна. Захиалга авдаг ресторан бол ширээний
          жагсаалтаа хадгалаад ширээ тус бүрийн QR үүсгэнэ.
        </p>
      </header>

      {error ? (
        <div className="rounded-[1.4rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {restaurant && baseQrUrl ? (
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-[1.7rem] border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
            <p className="text-xs uppercase tracking-[0.24em] text-black/45">
              Үндсэн менюгийн QR
            </p>
            <div className="mt-5 grid gap-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={baseQrUrl}
                alt="Рестораны QR"
                className="mx-auto aspect-square w-full max-w-xs rounded-[1.5rem] border border-black/10 bg-white p-4"
              />
              <button
                type="button"
                onClick={() =>
                  downloadImage(baseQrUrl, `${restaurant.slug}-menu-qr.png`)
                }
                className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white"
              >
                Үндсэн QR татах
              </button>
            </div>
          </section>

          {isOrderEnabled ? (
            <section className="rounded-[1.7rem] border border-black/10 bg-white p-6 text-black shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-black/45">
                    Ширээний QR
                  </p>
                  <h2 className="mt-2 font-display text-3xl">Ширээ удирдах</h2>
                </div>

                <div className="flex gap-2">
                  <input
                    value={newTable}
                    onChange={(event) => setNewTable(event.target.value)}
                    placeholder="Ширээний дугаар"
                    className="rounded-full border border-black/10 bg-[#fafafa] px-4 py-2 text-sm text-black outline-none placeholder:text-black/35"
                  />
                  <button
                    type="button"
                    disabled={savingTables}
                    onClick={() => {
                      const nextValue = normalizeTable(newTable);

                      if (!nextValue || tables.includes(nextValue)) {
                        return;
                      }

                      void saveTables(sortTableValues([...tables, nextValue]));
                    }}
                    className="rounded-full bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
                  >
                    Нэмэх
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tables.map((table) => {
                  const url = `${clientApiUrl}/public/qr/${restaurant.slug}/table/${table}`;

                  return (
                    <article
                      key={table}
                      className="rounded-[1.3rem] border border-black/10 bg-[#fafafa] p-4"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`Ширээ ${table}-ийн QR`}
                        className="aspect-square w-full rounded-[1rem] bg-white p-3"
                      />
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-black/45">
                            Ширээ
                          </p>
                          <p className="text-lg font-semibold">{table}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              downloadImage(url, `${restaurant.slug}-table-${table}.png`)
                            }
                            className="rounded-full border border-black/10 px-4 py-2 text-sm"
                          >
                            Татах
                          </button>
                          <button
                            type="button"
                            disabled={savingTables}
                            onClick={() =>
                              void saveTables(tables.filter((entry) => entry !== table))
                            }
                            className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/65 disabled:opacity-60"
                          >
                            Устгах
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {tables.length === 0 ? (
                <div className="mt-6 rounded-[1.2rem] border border-dashed border-black/10 bg-[#fafafa] px-5 py-8 text-center text-sm text-black/55">
                  Эхний ширээгээ нэмбэл ширээ тус бүрийн QR үүснэ.
                </div>
              ) : null}
            </section>
          ) : (
            <section className="rounded-[1.7rem] border border-black/10 bg-white p-6 text-black shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
              <p className="text-xs uppercase tracking-[0.24em] text-black/45">
                Зөвхөн меню горим
              </p>
              <h2 className="mt-2 font-display text-3xl">Нэг QR хангалттай</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-black/62">
                Энэ ресторан ширээ тус бүрээр захиалга авдаггүй тул зөвхөн нэг
                нийтийн QR ашиглана.
              </p>
            </section>
          )}
        </div>
      ) : null}
    </section>
  );
}
