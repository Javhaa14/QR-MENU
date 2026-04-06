"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import type { AuthResponse } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { clearStoredAuth, persistAuth } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function getNextPath() {
    if (typeof window === "undefined") {
      return "/admin";
    }

    return new URLSearchParams(window.location.search).get("next") ?? "/admin";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (
        response.user.role !== "restaurant_admin" ||
        !response.user.restaurantId
      ) {
        clearStoredAuth();
        setError(
          response.user.role === "superadmin"
            ? "Энэ хэсэг нь рестораны ажилтны нэвтрэх хэсэг байна."
            : "Энэ порталд нэвтрэх эрх алга байна.",
        );
        return;
      }

      persistAuth(response);
      router.replace(getNextPath());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Нэвтрэхэд алдаа гарлаа.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f5] px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)] lg:grid-cols-[0.92fr_1.08fr] lg:p-8">
        <section className="rounded-[1.7rem] bg-black p-8 text-white">
          <p className="text-xs uppercase tracking-[0.28em] text-white/50">
            Ажилтны портал
          </p>
          <h1 className="mt-4 font-display text-5xl leading-tight">
            Ресторанаа нэг самбараас шууд удирд.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
            Захиалга хянах, хоол харагдуулах эсэхийг солих, QR код татах, меню
            студи дээрээ шууд засвар хийх бүх үндсэн хэрэгсэл энд байна.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="grid gap-5 p-4 lg:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-black/45">
              Рестораны ажилтан
            </p>
            <h2 className="mt-3 font-display text-4xl text-[#231810]">
              Нэвтрэх
            </h2>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">И-мэйл</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="staff@restaurant.mn"
              className="rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 outline-none"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">Нууц үг</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 outline-none"
              required
            />
          </label>

          {error ? (
            <div className="rounded-[1rem] border border-red-500/20 bg-red-500/8 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
          </button>
        </form>
      </div>
    </main>
  );
}
