"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import type { Restaurant, StaffUser } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { getSuperadminContext } from "@/lib/portal";

export default function RestaurantStaffPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = String(params.id ?? "");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const context = getSuperadminContext();

    if (!context || !restaurantId) {
      return;
    }

    try {
      const [restaurantResponse, staffResponse] = await Promise.all([
        apiFetch<Restaurant>(`/restaurants/${restaurantId}`, {
          token: context.token,
        }),
        apiFetch<StaffUser[]>(`/restaurants/${restaurantId}/staff`, {
          token: context.token,
        }),
      ]);

      setRestaurant(restaurantResponse);
      setStaff(staffResponse);
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ажилтны бүртгэлүүдийг ачаалж чадсангүй.",
      );
    }
  }

  useEffect(() => {
    void load();
  }, [restaurantId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const context = getSuperadminContext();

    if (!context) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await apiFetch("/auth/register", {
        token: context.token,
        method: "POST",
        body: {
          email,
          password,
          restaurantId,
        },
      });

      setEmail("");
      setPassword("");
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ажилтны эрх үүсгэж чадсангүй.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)]">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          Ажилтны эрх
        </p>
        <h1 className="mt-3 font-display text-5xl text-[#231810]">
          {restaurant?.name ?? "Ресторан"} ажилтны эрхүүд
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60">
          Энэ ресторанд хамаарах `restaurant_admin` эрхүүдийг эндээс үүсгэж,
          шалгана. Шинэ ажилтан нээх эрх зөвхөн супер админд байна.
        </p>
      </header>

      {error ? (
        <div className="rounded-[1.4rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 rounded-[1.7rem] border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.04)]"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-black/45">
              Эрх үүсгэх
            </p>
            <h2 className="mt-3 font-display text-3xl text-[#231810]">
              Шинэ ресторан админ
            </h2>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">И-мэйл</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="manager@restaurant.mn"
              className="rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 outline-none"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">Нууц үг</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 outline-none"
              required
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Үүсгэж байна..." : "Ресторан админ үүсгэх"}
          </button>
        </form>

        <section className="rounded-[1.7rem] border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
          <p className="text-xs uppercase tracking-[0.24em] text-black/45">
            Одоо байгаа ажилтнууд
          </p>
          <div className="mt-5 grid gap-3">
            {staff.map((entry) => (
              <article
                key={entry._id}
                className="rounded-[1.1rem] border border-black/10 bg-white px-4 py-4"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-[#231810]">{entry.email}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-black/45">
                      {entry.role === "restaurant_admin"
                        ? "ресторан админ"
                        : "супер админ"}
                    </p>
                  </div>
                  <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">
                    энэ ресторанд хамаарна
                  </span>
                </div>
              </article>
            ))}
          </div>

          {staff.length === 0 ? (
            <div className="mt-5 rounded-[1.1rem] border border-dashed border-black/10 bg-[#fafafa] px-4 py-8 text-center text-sm text-black/55">
              Энэ ресторанд одоогоор ажилтны эрх алга байна.
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
