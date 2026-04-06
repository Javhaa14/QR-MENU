"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

import type { Order, Restaurant } from "@qr-menu/shared-types";

import { apiFetch, clientApiUrl } from "@/lib/api";
import { formatCurrency, timeAgo } from "@/lib/format";
import { countOrdersByStatus, getRestaurantAdminContext } from "@/lib/portal";

const statuses = ["pending", "preparing", "ready", "completed"] as const;
const statusLabels: Record<Order["status"], string> = {
  pending: "Шинэ",
  preparing: "Бэлтгэж байна",
  ready: "Бэлэн",
  completed: "Дууссан",
  cancelled: "Цуцлагдсан",
};

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

function playNotificationSound() {
  if (typeof window === "undefined") {
    return;
  }

  type BrowserWindow = Window & typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

  const AudioContextClass =
    window.AudioContext ?? (window as BrowserWindow).webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.value = 740;
  gain.gain.value = 0.001;

  oscillator.connect(gain);
  gain.connect(context.destination);

  const now = context.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  oscillator.start(now);
  oscillator.stop(now + 0.3);

  oscillator.onended = () => {
    void context.close();
  };
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState(Date.now());
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    async function load() {
      const context = getRestaurantAdminContext();

      if (!context) {
        return;
      }

      try {
        const [restaurantResponse, orderResponse] = await Promise.all([
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
        setOrders(orderResponse);
        setError(null);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Захиалгуудыг ачаалж чадсангүй.",
        );
      }
    }

    void load();
  }, [router]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const context = getRestaurantAdminContext();

    if (!context) {
      return;
    }

    const socket = io(process.env.NEXT_PUBLIC_WS_URL ?? clientApiUrl, {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      const nextContext = getRestaurantAdminContext();

      if (!nextContext) {
        return;
      }

      socket.emit("joinRestaurant", {
        restaurantId: nextContext.restaurantId,
        token: nextContext.token,
      });
    });

    socket.on("newOrder", (order: Order) => {
      setOrders((current) => {
        const exists = current.some((entry) => entry._id === order._id);
        return exists ? current : [order, ...current];
      });
      setToast(`Шинэ захиалга #${order._id?.slice(-6)}`);
      playNotificationSound();
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
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const pendingCount = countOrdersByStatus(orders, "pending");
    const baseTitle = restaurant?.name
      ? `${restaurant.name} | Захиалга`
      : "Захиалга | QR Menu";

    document.title =
      pendingCount > 0 ? `(${pendingCount}) ${baseTitle}` : baseTitle;

    return () => {
      document.title = "QR Menu";
    };
  }, [orders, restaurant?.name]);

  async function updateStatus(orderId: string, status: Order["status"]) {
    const context = getRestaurantAdminContext();

    if (!context) {
      return;
    }

    try {
      const updatedOrder = await apiFetch<Order>(
        `/orders/${context.restaurantId}/${orderId}/status`,
        {
          token: context.token,
          method: "PATCH",
          body: { status },
        },
      );

      setOrders((current) =>
        current.map((entry) => (entry._id === updatedOrder._id ? updatedOrder : entry)),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Захиалгын төлөв шинэчлэгдсэнгүй.",
      );
    }
  }

  const groupedOrders = useMemo(() => {
    return statuses.reduce<Record<string, Order[]>>((acc, status) => {
      acc[status] = orders.filter((order) => order.status === status);
      return acc;
    }, {});
  }, [orders]);

  const cancelledOrders = orders.filter((order) => order.status === "cancelled");

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.04)]">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          Шууд захиалга
        </p>
        <h1 className="mt-3 font-display text-5xl text-black">
          {restaurant?.name ?? "Гал тогооны самбар"}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-black/60">
          Энэ рестораны бодит цагийн захиалгын урсгал. Орж ирсэн захиалга
          шууд харагдаж, гал тогооны үе шатуудаар ангилагдана.
        </p>
      </header>

      {toast ? (
        <div className="rounded-[1.4rem] border border-black/10 bg-black px-5 py-4 text-sm text-white">
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
            className="rounded-[1.6rem] border border-black/10 bg-white p-4 text-black shadow-[0_12px_30px_rgba(0,0,0,0.04)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-2xl">{statusLabels[status]}</h2>
              <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/55">
                {groupedOrders[status]?.length ?? 0}
              </span>
            </div>

            <div className="grid gap-3">
              {groupedOrders[status]?.map((order) => {
                const stalePending =
                  status === "pending" &&
                  order.createdAt &&
                  clock - new Date(order.createdAt).getTime() > 10 * 60 * 1000;
                const nextStatus = getNextStatus(order.status);

                return (
                  <article
                    key={order._id}
                    className="rounded-[1.2rem] border bg-[#fafafa] p-4"
                    style={{
                      borderColor: stalePending
                        ? "rgba(248, 113, 113, 0.55)"
                        : "rgba(17,17,17,0.08)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">
                          #{order._id?.slice(-6)}
                        </p>
                        <p className="text-xs text-black/45">
                          Ширээ {order.tableNumber || "Орох захиалга"}
                        </p>
                      </div>
                      <p className="text-xs text-black/45">
                        {order.createdAt ? timeAgo(order.createdAt) : "саяхан"}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {order.items.map((item) => (
                        <div
                          key={`${order._id}-${item.menuItemId}`}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <div>
                            <span className="font-medium text-black/88">
                              {item.quantity}× {item.name}
                            </span>
                            {item.note ? (
                              <p className="text-xs text-black/45">{item.note}</p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm font-semibold">
                      <span>Нийт</span>
                      <span>{formatCurrency(order.totalPrice)}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {nextStatus ? (
                        <button
                          type="button"
                          onClick={() => void updateStatus(order._id ?? "", nextStatus)}
                          className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white"
                        >
                          {nextStatus === "preparing"
                            ? "Бэлтгэж эхлэх"
                            : nextStatus === "ready"
                              ? "Бэлэн болгох"
                              : "Дуусгах"}
                        </button>
                      ) : null}

                      {order.status === "pending" ? (
                        <button
                          type="button"
                          onClick={() => void updateStatus(order._id ?? "", "cancelled")}
                          className="rounded-full border border-black/10 px-4 py-2 text-xs text-black/65"
                        >
                          Цуцлах
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
        <section className="rounded-[1.6rem] border border-black/10 bg-white p-5 text-black shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
          <h2 className="font-display text-3xl">Цуцлагдсан</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cancelledOrders.map((order) => (
              <article
                key={order._id}
                className="rounded-[1.2rem] border border-black/10 bg-[#fafafa] p-4"
              >
                <p className="text-sm font-semibold">#{order._id?.slice(-6)}</p>
                <p className="mt-1 text-xs text-black/45">
                  {order.createdAt ? timeAgo(order.createdAt) : "саяхан"}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
