"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import type { AuthResponse } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { clearStoredAuth, persistAuth } from "@/lib/auth";

export default function SuperadminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function getNextPath() {
    if (typeof window === "undefined") {
      return "/superadmin";
    }

    return new URLSearchParams(window.location.search).get("next") ?? "/superadmin";
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

      if (response.user.role !== "superadmin") {
        clearStoredAuth();
        setError("Энэ хэсэгт супер админы эрх хэрэгтэй.");
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
      <div className="mx-auto grid max-w-6xl gap-8 rounded-[2.2rem] border border-black/10 bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)] lg:grid-cols-[1.02fr_0.98fr] lg:p-8">
        <section className="overflow-hidden rounded-[1.8rem] bg-black p-8 text-white">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">
            Супер админ
          </p>
          <h1 className="mt-4 max-w-lg font-display text-5xl leading-tight">
            Бүх ресторанаа нэг удирдлагын төвөөс хяна.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">
            Ресторан үүсгэх, ажилтан нээх, меню ба загвар удирдах, QR ажиллагааг
            нэг дороос цэгцтэй хянах супер админы самбар.
          </p>
          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {[
              "Ресторан үүсгэх",
              "Ажилтан нээх",
              "Студи хянах",
              "QR удирдах",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.1rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/78"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <form onSubmit={handleSubmit} className="grid gap-5 p-4 lg:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-black/45">
              Хамгаалалттай нэвтрэх
            </p>
            <h2 className="mt-3 font-display text-4xl text-[#231810]">
              Супер админ нэвтрэх
            </h2>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">И-мэйл</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@qrmenu.mn"
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
