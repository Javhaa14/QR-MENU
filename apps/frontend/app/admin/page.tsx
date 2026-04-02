"use client";

import { useEffect, useMemo, useState } from "react";

import type { Order, Restaurant, RestaurantStats } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";

function isToday(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function AdminDashboardPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    async function load() {
      try {
        const [restaurantResponse, ordersResponse] = await Promise.all([
          apiFetch<Restaurant>("/restaurant/me", { token }),
          apiFetch<Order[]>("/orders", { token }),
        ]);

        setRestaurant(restaurantResponse);
        setOrders(ordersResponse);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load dashboard.",
        );
      }
    }

    void load();
  }, []);

  const stats = useMemo<RestaurantStats>(() => {
    const todaysOrders = orders.filter((order) => isToday(order.createdAt));
    return {
      totalOrders: todaysOrders.length,
      revenue: todaysOrders.reduce((sum, order) => sum + order.totalPrice, 0),
      byStatus: {
        pending: todaysOrders.filter((order) => order.status === "pending").length,
        preparing: todaysOrders.filter((order) => order.status === "preparing")
          .length,
        ready: todaysOrders.filter((order) => order.status === "ready").length,
        completed: todaysOrders.filter((order) => order.status === "completed")
          .length,
        cancelled: todaysOrders.filter((order) => order.status === "cancelled")
          .length,
      },
    };
  }, [orders]);

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-black/10 bg-white/65 p-6 shadow-velvet">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          Dashboard
        </p>
        <h1 className="mt-3 font-display text-5xl text-[#231810]">
          {restaurant?.name ?? "Restaurant overview"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">
          A quick view into today’s service: order load, revenue, and what still
          needs attention.
        </p>
      </header>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/8 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-black/10 bg-white/65 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">
            Total orders
          </p>
          <p className="mt-3 text-4xl font-semibold text-[#231810]">
            {stats.totalOrders}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-black/10 bg-white/65 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">
            Revenue
          </p>
          <p className="mt-3 text-4xl font-semibold text-[#231810]">
            {formatCurrency(stats.revenue)}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-black/10 bg-white/65 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">
            Pending
          </p>
          <p className="mt-3 text-4xl font-semibold text-[#231810]">
            {stats.byStatus.pending}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-black/10 bg-white/65 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45">
            Completed
          </p>
          <p className="mt-3 text-4xl font-semibold text-[#231810]">
            {stats.byStatus.completed}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[1.7rem] border border-black/10 bg-[#16120f] p-6 text-white">
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

        <section className="rounded-[1.7rem] border border-black/10 bg-white/65 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-black/45">
            Recent orders
          </p>
          <div className="mt-5 grid gap-3">
            {orders.slice(0, 6).map((order) => (
              <article
                key={order._id}
                className="rounded-[1rem] border border-black/10 bg-white/70 px-4 py-3"
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
        </section>
      </div>
    </section>
  );
}
