"use client";

import type { Order, OrderStatus, RestaurantStats, UserRole } from "@qr-menu/shared-types";

import { getAuthTokenPayload, getStoredToken } from "@/lib/auth";

export interface StoredAuthContext {
  token: string;
  role: UserRole;
  restaurantId: string | null;
  email: string;
  userId: string;
}

export const DEFAULT_QR_TABLES = Array.from({ length: 12 }, (_value, index) =>
  String(index + 1),
);

export function getStoredAuthContext(): StoredAuthContext | null {
  const token = getStoredToken();
  const payload = getAuthTokenPayload();

  if (!token || !payload) {
    return null;
  }

  return {
    token,
    role: payload.role,
    restaurantId: payload.restaurantId,
    email: payload.email,
    userId: payload.sub,
  };
}

export function getRestaurantAdminContext() {
  const context = getStoredAuthContext();

  if (
    !context ||
    context.role !== "restaurant_admin" ||
    !context.restaurantId
  ) {
    return null;
  }

  return context;
}

export function getSuperadminContext() {
  const context = getStoredAuthContext();

  if (!context || context.role !== "superadmin") {
    return null;
  }

  return context;
}

export function isDateToday(value?: string) {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function buildRestaurantStats(orders: Order[]): RestaurantStats {
  const todaysOrders = orders.filter((order) => isDateToday(order.createdAt));
  const byStatus = createEmptyStatusRecord();

  for (const order of todaysOrders) {
    byStatus[order.status] += 1;
  }

  return {
    totalOrders: todaysOrders.length,
    revenue: todaysOrders.reduce((sum, order) => sum + order.totalPrice, 0),
    byStatus,
  };
}

export function countOrdersByStatus(
  orders: Order[],
  status: OrderStatus,
) {
  return orders.filter((order) => order.status === status).length;
}

function createEmptyStatusRecord(): Record<OrderStatus, number> {
  return {
    pending: 0,
    preparing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0,
  };
}
