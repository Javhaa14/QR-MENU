"use client";

import { useEffect, useMemo, useState } from "react";

import type { Order, Restaurant, RestaurantStats } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { buildRestaurantStats, getRestaurantAdminContext } from "@/lib/portal";

export default function AdminDashboardPage() {
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

        setRestaurant(restaurantResponse);
        setOrders(ordersResponse);
        setError(null);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const stats = useMemo<RestaurantStats>(() => buildRestaurantStats(orders), [orders]);

  return (
    <section className="grid gap-6">
      <header className="overflow-hidden rounded-[2rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(104,180,154,0.18),transparent_32%),linear-gradient(135deg,#173233,#102021)] p-6 text-white shadow-velvet">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">
          Dashboard
        </p>
        <h1 className="mt-3 font-display text-5xl text-white">
          {restaurant?.name ?? "Restaurant overview"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68">
          Today’s service snapshot for one restaurant only: orders in flight,
          revenue already captured, and where the kitchen queue still needs
          attention.
        </p>
      </header>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/8 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
            Total orders
          </p>
          <p className="mt-3 text-4xl font-semibold">
            {loading ? "..." : stats.totalOrders}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
            Revenue
          </p>
          <p className="mt-3 text-4xl font-semibold">
            {loading ? "..." : formatCurrency(stats.revenue)}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
            Pending
          </p>
          <p className="mt-3 text-4xl font-semibold">
            {loading ? "..." : stats.byStatus.pending}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">
            Ready / completed
          </p>
          <p className="mt-3 text-4xl font-semibold">
            {loading
              ? "..."
              : `${stats.byStatus.ready} / ${stats.byStatus.completed}`}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.7rem] border border-white/8 bg-[#132426] p-6 text-white">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">
            Status distribution
          </p>
          <div className="mt-5 grid gap-3">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <span className="capitalize text-white/72">{status}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.7rem] border border-white/8 bg-white/90 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-black/45">
            Recent orders
          </p>
          <div className="mt-5 grid gap-3">
            {orders.slice(0, 6).map((order) => (
              <article
                key={order._id}
                className="rounded-[1rem] border border-black/10 bg-white px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#231810]">
                      #{order._id?.slice(-6)}
                    </p>
                    <p className="text-xs text-black/50">{order.status}</p>
                  </div>
                  <p className="text-sm font-semibold text-[#231810]">
                    {formatCurrency(order.totalPrice)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {!loading && orders.length === 0 ? (
            <div className="mt-5 rounded-[1rem] border border-dashed border-black/10 bg-[#f8f3ea] px-4 py-8 text-center text-sm text-black/55">
              No orders yet today.
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
