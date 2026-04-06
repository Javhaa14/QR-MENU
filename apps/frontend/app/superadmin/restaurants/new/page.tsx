"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import type {
  Restaurant,
  RestaurantPlan,
  RestaurantType,
} from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { createSlugPreview } from "@/lib/slug";
import { getSuperadminContext } from "@/lib/portal";

export default function NewRestaurantPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<RestaurantPlan>("free");
  const [restaurantType, setRestaurantType] =
    useState<RestaurantType>("menu_only");
  const [logo, setLogo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const slugPreview = useMemo(() => createSlugPreview(name), [name]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const context = getSuperadminContext();

    if (!context) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const restaurant = await apiFetch<Restaurant>("/restaurants", {
        token: context.token,
        method: "POST",
        body: {
          name,
          plan,
          restaurantType,
          logo: logo.trim() || undefined,
          slug: slugPreview,
        },
      });

      router.replace(`/superadmin/restaurants/${restaurant._id}/menu`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Ресторан үүсгэж чадсангүй.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)]">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          Шинэ ресторан
        </p>
        <h1 className="mt-3 font-display text-5xl text-[#231810]">
          Шинэ ресторан үүсгэх
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60">
          Эхлээд үндсэн мэдээллээ оруулна. Үүсмэгц нь шууд меню студи рүү орж,
          зочинд харагдах туршлагыг бүрдүүлж эхэлнэ.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.04)] lg:grid-cols-[0.85fr_1.15fr]"
      >
        <section className="rounded-[1.6rem] bg-black p-6 text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">
            Хаягийн харагдац
          </p>
          <h2 className="mt-3 font-display text-4xl">
            /menu/{slugPreview || "restaurant-ner"}
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            Энэ хаяг рестораны нэрээс автоматаар үүсэж нийтийн QR менюгийн линк болно.
          </p>
        </section>

        <section className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">Рестораны нэр</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Жишээ нь: Хаан бууз"
              className="rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 outline-none"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">План</span>
            <select
              value={plan}
              onChange={(event) =>
                setPlan(event.target.value as RestaurantPlan)
              }
              className="rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 outline-none"
            >
              <option value="free">Үнэгүй</option>
              <option value="pro">Pro</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">
              Рестораны төрөл
            </span>
            <select
              value={restaurantType}
              onChange={(event) =>
                setRestaurantType(event.target.value as RestaurantType)
              }
              className="rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 outline-none"
            >
              <option value="menu_only">Зөвхөн меню</option>
              <option value="order_enabled">Захиалга авдаг</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">
              Логоны URL (заавал биш)
            </span>
            <input
              value={logo}
              onChange={(event) => setLogo(event.target.value)}
              placeholder="https://..."
              className="rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 outline-none"
            />
          </label>

          {error ? (
            <div className="rounded-[1rem] border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving || !slugPreview}
            className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Үүсгэж байна..." : "Ресторан үүсгэх"}
          </button>
        </section>
      </form>
    </section>
  );
}
