"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import type { Order, Restaurant } from "@qr-menu/shared-types";

import { apiFetch, clientApiUrl } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import { formatCurrency, timeAgo } from "@/lib/format";

const statuses = ["pending", "preparing", "ready", "completed"] as const;

function getNextStatus(status: Order["status"]) {
  switch (status) {
    case "pending":
      return "preparing";
    case "preparing":
      return "ready";
    case "ready":
      return "completed";
    default:
      return null;
  }
}

export default function AdminOrdersPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState(Date.now());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    async function load() {
      try {
        const [restaurantResponse, orderResponse] = await Promise.all([
          apiFetch<Restaurant>("/restaurant/me", { token }),
          apiFetch<Order[]>("/orders", { token }),
        ]);
        setRestaurant(restaurantResponse);
        setOrders(orderResponse);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load orders.",
        );
      }
    }

    void load();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!restaurant?._id) return;

    const socket = io(process.env.NEXT_PUBLIC_WS_URL ?? clientApiUrl, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinRestaurant", { restaurantId: restaurant._id });
    });

    socket.on("newOrder", (order: Order) => {
      setOrders((current) => {
        const exists = current.some((entry) => entry._id === order._id);
        return exists ? current : [order, ...current];
      });
      setToast(`New order #${order._id?.slice(-6)}`);
    });

    socket.on("orderUpdated", (order: Order) => {
      setOrders((current) =>
        current.map((entry) => (entry._id === order._id ? order : entry)),
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [restaurant?._id]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function updateStatus(orderId: string, status: Order["status"]) {
    const token = getStoredToken();
    if (!token) return;

    try {
      const updatedOrder = await apiFetch<Order>(`/orders/${orderId}/status`, {
        token,
        method: "PATCH",
        body: { status },
      });

      setOrders((current) =>
        current.map((entry) => (entry._id === updatedOrder._id ? updatedOrder : entry)),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update order.",
      );
    }
  }

  const groupedOrders = useMemo(() => {
    return statuses.reduce<Record<string, Order[]>>((acc, status) => {
      acc[status] = orders.filter((order) => order.status === status);
      return acc;
    }, {});
  }, [orders, clock]);

  const cancelledOrders = orders.filter((order) => order.status === "cancelled");

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-black/10 bg-white/65 p-6 shadow-velvet">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          Live orders
        </p>
        <h1 className="mt-3 font-display text-5xl text-[#231810]">
          Kitchen board
        </h1>
      </header>

      {toast ? (
        <div className="rounded-[1.4rem] border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-700">
          {toast}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[1.4rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        {statuses.map((status) => (
          <section
            key={status}
            className="rounded-[1.6rem] border border-black/10 bg-white/65 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl capitalize text-[#231810]">
                {status}
              </h2>
              <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/50">
                {groupedOrders[status]?.length ?? 0}
              </span>
            </div>

            <div className="grid gap-3">
              {groupedOrders[status]?.map((order) => {
                const stalePending =
                  status === "pending" &&
                  order.createdAt &&
                  Date.now() - new Date(order.createdAt).getTime() > 10 * 60 * 1000;
                const nextStatus = getNextStatus(order.status);

                return (
                  <article
                    key={order._id}
                    className="rounded-[1.2rem] border bg-white/80 p-4"
                    style={{
                      borderColor: stalePending
                        ? "rgba(220, 38, 38, 0.45)"
                        : "rgba(0,0,0,0.08)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#231810]">
                          #{order._id?.slice(-6)}
                        </p>
                        <p className="text-xs text-black/45">
                          Table {order.tableNumber || "Walk-in"}
                        </p>
                      </div>
                      <p className="text-xs text-black/45">
                        {order.createdAt ? timeAgo(order.createdAt) : "just now"}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {order.items.map((item) => (
                        <div
                          key={`${order._id}-${item.menuItemId}`}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <div>
                            <span className="font-medium text-[#231810]">
                              {item.quantity}× {item.name}
                            </span>
                            {item.note ? (
                              <p className="text-xs text-black/45">{item.note}</p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm font-semibold text-[#231810]">
                      <span>Total</span>
                      <span>{formatCurrency(order.totalPrice)}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {nextStatus ? (
                        <button
                          type="button"
                          onClick={() => void updateStatus(order._id ?? "", nextStatus)}
                          className="rounded-full bg-[#231810] px-4 py-2 text-xs font-semibold text-white"
                        >
                          {nextStatus === "preparing"
                            ? "Start preparing"
                            : nextStatus === "ready"
                              ? "Mark ready"
                              : "Complete"}
                        </button>
                      ) : null}

                      {order.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => void updateStatus(order._id ?? "", "cancelled")}
                          className="rounded-full border border-red-500/20 px-4 py-2 text-xs text-red-700"
                        >
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {cancelledOrders.length > 0 ? (
        <section className="rounded-[1.6rem] border border-black/10 bg-white/65 p-5">
          <h2 className="font-display text-3xl text-[#231810]">Cancelled</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cancelledOrders.map((order) => (
              <article
                key={order._id}
                className="rounded-[1.2rem] border border-black/10 bg-white/80 p-4"
              >
                <p className="text-sm font-semibold text-[#231810]">
                  #{order._id?.slice(-6)}
                </p>
                <p className="mt-1 text-xs text-black/45">
                  {order.createdAt ? timeAgo(order.createdAt) : "just now"}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
