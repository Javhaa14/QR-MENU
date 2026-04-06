"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { Order, Restaurant, RestaurantStats } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { buildRestaurantStats, getRestaurantAdminContext } from "@/lib/portal";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const context = getRestaurantAdminContext();

      if (!context) {
        return;
      }

      try {
        const [restaurantResponse, ordersResponse] = await Promise.all([
          apiFetch<Restaurant>("/restaurants/me", { token: context.token }),
          apiFetch<Order[]>(`/orders/${context.restaurantId}`, {
            token: context.token,
          }),
        ]);

        if (restaurantResponse.restaurantType === "menu_only") {
          router.replace("/admin/menu");
          return;
        }

        setRestaurant(restaurantResponse);
        setOrders(ordersResponse);
        setError(null);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Хянах самбарыг ачаалж чадсангүй.",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [router]);

  const stats = useMemo<RestaurantStats>(() => buildRestaurantStats(orders), [orders]);

  return (
    <section className="grid gap-6">
      <header className="overflow-hidden rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)]">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          Хянах самбар
        </p>
        <h1 className="mt-3 font-display text-5xl text-black">
          {restaurant?.name ?? "Рестораны тойм"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">
          Өнөөдрийн үйлчилгээний товч зураглал: хэдэн захиалга явж байгаа,
          ямар орлого орсон, гал тогоонд хаана анхаарах хэрэгтэйг эндээс харна.
        </p>
      </header>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/8 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 text-black shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">
            Нийт захиалга
          </p>
          <p className="mt-3 text-4xl font-semibold">
            {loading ? "..." : stats.totalOrders}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 text-black shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">
            Орлого
          </p>
          <p className="mt-3 text-4xl font-semibold">
            {loading ? "..." : formatCurrency(stats.revenue)}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 text-black shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">
            Хүлээгдэж буй
          </p>
          <p className="mt-3 text-4xl font-semibold">
            {loading ? "..." : stats.byStatus.pending}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 text-black shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">
            Бэлэн / дууссан
          </p>
          <p className="mt-3 text-4xl font-semibold">
            {loading
              ? "..."
              : `${stats.byStatus.ready} / ${stats.byStatus.completed}`}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.7rem] border border-black/10 bg-white p-6 text-black shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
          <p className="text-xs uppercase tracking-[0.24em] text-black/45">
            Төлвийн хуваарилалт
          </p>
          <div className="mt-5 grid gap-3">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3 text-sm"
              >
                <span className="capitalize text-black/72">
                  {status === "pending"
                    ? "Хүлээгдэж буй"
                    : status === "preparing"
                      ? "Бэлтгэж байна"
                      : status === "ready"
                        ? "Бэлэн"
                        : status === "completed"
                          ? "Дууссан"
                          : "Цуцлагдсан"}
                </span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.7rem] border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
          <p className="text-xs uppercase tracking-[0.24em] text-black/45">
            Сүүлийн захиалга
          </p>
          <div className="mt-5 grid gap-3">
            {orders.slice(0, 6).map((order) => (
              <article
                key={order._id}
                className="rounded-[1rem] border border-black/10 bg-[#fafafa] px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#231810]">
                      #{order._id?.slice(-6)}
                    </p>
                    <p className="text-xs text-black/50">
                      {order.status === "pending"
                        ? "Хүлээгдэж буй"
                        : order.status === "preparing"
                          ? "Бэлтгэж байна"
                          : order.status === "ready"
                            ? "Бэлэн"
                            : order.status === "completed"
                              ? "Дууссан"
                              : "Цуцлагдсан"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[#231810]">
                    {formatCurrency(order.totalPrice)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {!loading && orders.length === 0 ? (
            <div className="mt-5 rounded-[1rem] border border-dashed border-black/10 bg-[#fafafa] px-4 py-8 text-center text-sm text-black/55">
              Өнөөдөр захиалга алга байна.
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
