"use client";

import type { AuthResponse } from "@qr-menu/shared-types";

const TOKEN_KEY = "qr_menu_token";
const USER_KEY = "qr_menu_user";

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthResponse["user"]) : null;
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
