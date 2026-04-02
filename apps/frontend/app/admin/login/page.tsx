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
            ? "Please use the staff login portal."
            : "Not authorized for this portal.",
        );
        return;
      }

      persistAuth(response);
      router.replace(getNextPath());
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Login failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f1ea] px-4 py-10">
      <div className="mx-auto grid max-w-5xl gap-8 rounded-[2rem] border border-black/10 bg-[#eef1eb] p-6 shadow-velvet lg:grid-cols-[0.92fr_1.08fr] lg:p-8">
        <section className="rounded-[1.7rem] bg-[#102021] p-8 text-white">
          <p className="text-xs uppercase tracking-[0.28em] text-white/50">
            Staff Portal
          </p>
          <h1 className="mt-4 font-display text-5xl leading-tight">
            Keep one restaurant moving in real time.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/65">
            Use the restaurant staff workspace to watch incoming orders, update
            statuses, toggle item availability, and download ready-to-place QR
            codes for the dining room.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="grid gap-5 p-4 lg:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-black/45">
              Restaurant Admin
            </p>
            <h2 className="mt-3 font-display text-4xl text-[#231810]">
              Staff login
            </h2>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="staff@restaurant.com"
              className="rounded-[1rem] border border-black/10 bg-white/70 px-4 py-3 outline-none"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-[1rem] border border-black/10 bg-white/70 px-4 py-3 outline-none"
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
            className="rounded-full bg-[#102021] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
