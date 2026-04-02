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
        setError("Not authorized");
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
    <main className="min-h-screen bg-[#f1e6d7] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 rounded-[2.2rem] border border-black/10 bg-white/70 p-6 shadow-velvet lg:grid-cols-[1.02fr_0.98fr] lg:p-8">
        <section className="overflow-hidden rounded-[1.8rem] bg-[#1f1711] p-8 text-white">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">
            Superadmin
          </p>
          <h1 className="mt-4 max-w-lg font-display text-5xl leading-tight">
            Operate the full QR menu fleet from one control plane.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/65">
            Create restaurants, provision staff accounts, manage menus and
            themes, and keep restaurant operations visible without ever exposing
            one tenant to another.
          </p>
          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {[
              "Restaurant lifecycle",
              "Scoped staff provisioning",
              "Theme previews",
              "QR code operations",
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
              Secure access
            </p>
            <h2 className="mt-3 font-display text-4xl text-[#231810]">
              Superadmin login
            </h2>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@qrmenu.com"
              className="rounded-[1rem] border border-black/10 bg-white/75 px-4 py-3 outline-none"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-black/65">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-[1rem] border border-black/10 bg-white/75 px-4 py-3 outline-none"
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
            className="rounded-full bg-[#1f1711] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Enter control plane"}
          </button>
        </form>
      </div>
    </main>
  );
}
