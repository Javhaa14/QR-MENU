"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { clearStoredAuth, getAuthTokenPayload, getStoredToken } from "@/lib/auth";
import { PortalBackButton } from "@/components/admin/PortalBackButton";

const navItems = [
  { href: "/superadmin", label: "Рестораны удирдлага" },
  { href: "/superadmin/templates", label: "Загварын сан" },
  { href: "/superadmin/restaurants/new", label: "Шинэ ресторан" },
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
  const showBackButton = !isLoginRoute && pathname !== "/superadmin";

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
    return <div className="min-h-screen bg-[#f7f7f5]" />;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-black">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[280px_1fr] lg:px-6">
        <aside className="rounded-[2rem] border border-black/10 bg-white p-5 text-black shadow-[0_18px_40px_rgba(0,0,0,0.04)] lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <p className="text-xs uppercase tracking-[0.24em] text-black/45">
            Супер админ
          </p>
          <h1 className="mt-3 font-display text-4xl">QR Menu удирдлага</h1>
          <p className="mt-3 text-sm leading-7 text-black/62">
            Ресторан бүрийн загвар, меню, ажилтан, QR ажиллагааг нэг төвөөс
            удирдана.
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
                    background: active ? "#111111" : "transparent",
                    color: active ? "#ffffff" : "rgba(0,0,0,0.66)",
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
            className="mt-8 rounded-full border border-black/10 px-4 py-2 text-sm text-black/70"
          >
            Гарах
          </button>
        </aside>

        <main className="min-w-0">
          {showBackButton ? (
            <div className="mb-4">
              <PortalBackButton fallbackHref="/superadmin" />
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
