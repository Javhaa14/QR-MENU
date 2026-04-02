"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { clearStoredAuth, getAuthTokenPayload, getStoredToken } from "@/lib/auth";

const navItems = [
  { href: "/superadmin", label: "Dashboard" },
  { href: "/superadmin/restaurants/new", label: "New Restaurant" },
];

export function SuperadminLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const isLoginRoute = pathname === "/superadmin/login";
  const payload = getAuthTokenPayload();

  useEffect(() => {
    const token = getStoredToken();

    if (isLoginRoute) {
      if (token && payload?.role === "superadmin") {
        router.replace("/superadmin");
      }

      return;
    }

    if (!token || payload?.role !== "superadmin") {
      router.replace("/superadmin/login");
      return;
    }

    setReady(true);
  }, [isLoginRoute, payload?.role, router]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (!ready) {
    return <div className="min-h-screen bg-[#f4ede3]" />;
  }

  return (
    <div className="min-h-screen bg-[#f4ede3] text-[#1b140f]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
        <aside className="rounded-[2rem] bg-[#1d1712] p-5 text-white shadow-velvet lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">
            Superadmin
          </p>
          <h1 className="mt-3 font-display text-4xl">QR Menu Control</h1>
          <p className="mt-3 text-sm leading-7 text-white/62">
            Restaurant lifecycle, staff provisioning, themes, menus, and QR
            operations from a single control plane.
          </p>

          <nav className="mt-8 grid gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[1.2rem] px-4 py-3 text-sm transition"
                  style={{
                    background: active ? "rgba(255,255,255,0.12)" : "transparent",
                    color: active ? "white" : "rgba(255,255,255,0.72)",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => {
              clearStoredAuth();
              router.replace("/superadmin/login");
            }}
            className="mt-8 rounded-full border border-white/12 px-4 py-2 text-sm text-white/70"
          >
            Log out
          </button>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
