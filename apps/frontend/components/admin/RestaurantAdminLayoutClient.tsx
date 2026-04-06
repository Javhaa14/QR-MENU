"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import type { RestaurantType } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import {
  clearStoredAuth,
  getAuthTokenPayload,
  getStoredToken,
} from "@/lib/auth";
import { getRestaurantAdminContext } from "@/lib/portal";

import { CenteredStatusMessage } from "@/components/portal/CenteredStatusMessage";
import { PortalBackButton } from "@/components/admin/PortalBackButton";

const orderEnabledNavItems = [
  { href: "/admin", label: "Хянах самбар" },
  { href: "/admin/menu", label: "Меню студи" },
  { href: "/admin/orders", label: "Захиалга" },
  { href: "/admin/availability", label: "Бэлэн байдал" },
  { href: "/admin/qr", label: "QR код" },
];

const menuOnlyNavItems = [
  { href: "/admin/menu", label: "Меню студи" },
  { href: "/admin/availability", label: "Бэлэн байдал" },
  { href: "/admin/qr", label: "QR код" },
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
  const [restaurantType, setRestaurantType] =
    useState<RestaurantType | null>(null);
  const isLoginRoute = pathname === "/admin/login";
  const payload = getAuthTokenPayload();
  const navItems =
    restaurantType === "menu_only" ? menuOnlyNavItems : orderEnabledNavItems;

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
      setPortalMessage("Энэ хэсэг нь рестораны ажилтны нэвтрэх хэсэг байна.");
      return;
    }

    if (payload?.role !== "restaurant_admin") {
      clearStoredAuth();
      setPortalMessage("Энэ портал зөвхөн рестораны ажилтанд нээлттэй.");
      return;
    }

    const context = getRestaurantAdminContext();

    if (!context) {
      clearStoredAuth();
      router.replace("/admin/login");
      return;
    }

    async function loadRestaurantType() {
      try {
        const nextContext = getRestaurantAdminContext();

        if (!nextContext) {
          clearStoredAuth();
          router.replace("/admin/login");
          return;
        }

        const restaurant = await apiFetch<{
          restaurantType: RestaurantType;
        }>("/restaurants/me", {
          token: nextContext.token,
        });

        setRestaurantType(restaurant.restaurantType);
        setReady(true);
        setErrorFreePath(restaurant.restaurantType, pathname, router);
      } catch (requestError) {
        setPortalMessage(
          requestError instanceof Error
            ? requestError.message
            : "Рестораны хандалтыг шалгаж чадсангүй.",
        );
      }
    }

    void loadRestaurantType();
  }, [isLoginRoute, payload?.role, router]);

  useEffect(() => {
    if (isLoginRoute || !restaurantType) {
      return;
    }

    setErrorFreePath(restaurantType, pathname, router);
  }, [isLoginRoute, pathname, restaurantType, router]);

  const basePath = restaurantType === "menu_only" ? "/admin/menu" : "/admin";
  const showBackButton = !isLoginRoute && pathname !== basePath;

  if (isLoginRoute) {
    return <>{children}</>;
  }

  if (portalMessage) {
    return (
      <CenteredStatusMessage
        title="Хандалт шинэчлэгдлээ"
        description={portalMessage}
      />
    );
  }

  if (!ready) {
    return <div className="min-h-screen bg-[#f7f7f5]" />;
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-black">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-4 lg:grid-cols-[260px_1fr] lg:px-6">
        <aside className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_18px_40px_rgba(0,0,0,0.04)] lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
          <p className="text-xs uppercase tracking-[0.24em] text-black/45">
            Ажилтны портал
          </p>
          <h1 className="mt-3 font-display text-4xl text-black">
            Үйлчилгээний самбар
          </h1>
          <p className="mt-3 text-sm leading-7 text-black/58">
            {restaurantType === "menu_only"
              ? "Меню, загвар, харагдац, QR-аа нэг рестораны түвшинд удирдана."
              : "Захиалга, харагдац, ширээний QR кодыг нэг багийн түвшинд удирдана."}
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
              router.replace("/admin/login");
            }}
            className="mt-8 rounded-full border border-black/10 px-4 py-2 text-sm text-black/70"
          >
            Гарах
          </button>
        </aside>

        <main className="min-w-0">
          {showBackButton ? (
            <div className="mb-4">
              <PortalBackButton fallbackHref={basePath} />
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}

function setErrorFreePath(
  restaurantType: RestaurantType,
  pathname: string,
  router: ReturnType<typeof useRouter>,
) {
  if (
    restaurantType === "menu_only" &&
    (pathname === "/admin" || pathname.startsWith("/admin/orders"))
  ) {
    router.replace("/admin/menu");
    return;
  }

  if (restaurantType !== "menu_only" && pathname.startsWith("/admin/menu")) {
    return;
  }
}
