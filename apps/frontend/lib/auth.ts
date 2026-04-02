"use client";

import type { AuthResponse, UserRole } from "@qr-menu/shared-types";

const TOKEN_KEY = "qr_menu_token";
const USER_KEY = "qr_menu_user";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  restaurantId: string | null;
  iat?: number;
  exp?: number;
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function decodeJwtPayload(token: string): AuthTokenPayload | null {
  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = window.atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(decoded) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(USER_KEY);

  if (raw) {
    return JSON.parse(raw) as AuthResponse["user"];
  }

  const token = getStoredToken();
  const payload = token ? decodeJwtPayload(token) : null;

  if (!payload) {
    return null;
  }

  return {
    _id: payload.sub,
    email: payload.email,
    restaurantId: payload.restaurantId,
    role: payload.role,
  } satisfies AuthResponse["user"];
}

export function getAuthTokenPayload() {
  const token = getStoredToken();
  return token ? decodeJwtPayload(token) : null;
}

export function getStoredRole() {
  return getAuthTokenPayload()?.role ?? getStoredUser()?.role ?? null;
}

export function getStoredRestaurantId() {
  return (
    getAuthTokenPayload()?.restaurantId ??
    getStoredUser()?.restaurantId ??
    null
  );
}

export function persistAuth(response: AuthResponse) {
  window.localStorage.setItem(TOKEN_KEY, response.accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(response.user));
  document.cookie = `${TOKEN_KEY}=${response.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}

export function clearStoredAuth() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; samesite=lax`;
}
