"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import {
  clearStoredAuth,
  getAuthTokenPayload,
  getStoredToken,
} from "@/lib/auth";

import { CenteredStatusMessage } from "@/components/portal/CenteredStatusMessage";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/availability", label: "Availability" },
  { href: "/admin/qr", label: "QR Codes" },
];

export function RestaurantAdminLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [portalMessage, setPortalMessage] = useState<string | null>(null);
  const isLoginRoute = pathname === "/admin/login";
  const payload = getAuthTokenPayload();

  useEffect(() => {
    const token = getStoredToken();

    if (isLoginRoute) {
      if (token && payload?.role === "restaurant_admin") {
        router.replace("/admin");
      }

      return;
    }

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (payload?.role === "superadmin") {
      clearStoredAuth();
      setPortalMessage("Please use the staff login portal.");
      return;
    }

    if (payload?.role !== "restaurant_admin") {
      clearStoredAuth();
      setPortalMessage("This portal is only available to restaurant staff.");
      return;
    }

    setReady(true);
  }, [isLoginRoute, payload?.role, router]);

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (portalMessage) {
    return (
      <CenteredStatusMessage
        title="Access cleared"
        description={portalMessage}
      />
    );
  }

  if (!ready) {
    return <div className="min-h-screen bg-[#0f1717]" />;
  }

  return (
    <div className="min-h-screen bg-[#0f1717] text-[#f5f5ef]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[260px_1fr] lg:px-6">
        <aside className="rounded-[2rem] border border-white/6 bg-[#151f1f] p-5 shadow-velvet lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">
            Staff Portal
          </p>
          <h1 className="mt-3 font-display text-4xl">Service Flow</h1>
          <p className="mt-3 text-sm leading-7 text-white/58">
            Orders, availability, and table-ready QR tools for a single
            restaurant team.
          </p>

          <nav className="mt-8 grid gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[1.15rem] px-4 py-3 text-sm transition"
                  style={{
                    background: active ? "rgba(148, 196, 170, 0.18)" : "transparent",
                    color: active ? "#f5f5ef" : "rgba(245,245,239,0.74)",
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
            Logout
          </button>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
