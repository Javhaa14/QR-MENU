"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { clearStoredAuth, getStoredToken, getStoredUser } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/theme", label: "Theme" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/qr", label: "QR Codes" },
];

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const user = useMemo(() => getStoredUser(), [ready]);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#f5f1ea] px-6 py-10">
        <div className="mx-auto h-20 max-w-6xl animate-pulse rounded-[2rem] bg-white/60" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1ea] text-[#231810]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[260px_1fr] lg:px-6">
        <aside className="rounded-[2rem] border border-black/8 bg-[#16120f] p-5 text-white shadow-velvet lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">
              QR Menu
            </p>
            <h1 className="font-display text-3xl">{user?.email ?? "Admin"}</h1>
            <p className="text-sm text-white/55">
              Restaurant operations, menu editing, themes, and live orders.
            </p>
          </div>

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
              router.replace("/admin/login");
            }}
            className="mt-8 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70"
          >
            Log out
          </button>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
