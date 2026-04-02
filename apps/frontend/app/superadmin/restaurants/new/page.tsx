"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import type { Restaurant, RestaurantPlan } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { createSlugPreview } from "@/lib/slug";
import { getSuperadminContext } from "@/lib/portal";

export default function NewRestaurantPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<RestaurantPlan>("free");
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
          logo: logo.trim() || undefined,
          slug: slugPreview,
        },
      });

      router.replace(`/superadmin/restaurants/${restaurant._id}/menu`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create restaurant.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-black/10 bg-[#f8f1e7] p-6 shadow-velvet">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          New Restaurant
        </p>
        <h1 className="mt-3 font-display text-5xl text-[#231810]">
          Create a new tenant
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60">
          Set the restaurant basics first. You’ll land in the menu editor right
          after creation so you can start building the guest-facing experience.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-velvet lg:grid-cols-[0.85fr_1.15fr]"
      >
        <section className="rounded-[1.6rem] bg-[#211913] p-6 text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">
            URL Preview
          </p>
          <h2 className="mt-3 font-display text-4xl">
            /menu/{slugPreview || "your-restaurant"}
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            Slugs are generated from the restaurant name and become the public QR
            menu URL.
          </p>
        </section>

        <section className="grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">Restaurant name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Cinder & Salt"
              className="rounded-[1rem] border border-black/10 bg-white px-4 py-3 outline-none"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">Plan</span>
            <select
              value={plan}
              onChange={(event) =>
                setPlan(event.target.value as RestaurantPlan)
              }
              className="rounded-[1rem] border border-black/10 bg-white px-4 py-3 outline-none"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">
              Logo URL (optional)
            </span>
            <input
              value={logo}
              onChange={(event) => setLogo(event.target.value)}
              placeholder="https://..."
              className="rounded-[1rem] border border-black/10 bg-white px-4 py-3 outline-none"
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
            className="rounded-full bg-[#231810] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create restaurant"}
          </button>
        </section>
      </form>
    </section>
  );
}
