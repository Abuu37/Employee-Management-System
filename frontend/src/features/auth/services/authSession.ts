// This file manages authentication session data, such as storing and clearing JWT tokens in localStorage.

import type { LoginResponse } from "@/features/auth/types/auth.types";

export const AUTH_STORAGE_KEYS = {
  token: "token",
} as const;

export const getAccessToken = (): string | null =>
  localStorage.getItem(AUTH_STORAGE_KEYS.token);

export const setAccessToken = (token: string): void => {
  localStorage.setItem(AUTH_STORAGE_KEYS.token, token);
};

export const setAuthFromLoginResponse = (payload: LoginResponse): void => {
  const nextToken = payload.accessToken || payload.token;
  if (nextToken) {
    setAccessToken(nextToken);
  }
};

const LEGACY_KEYS = ["user-role", "user-name", "user-email", "user-id"];

export const clearAuthSession = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEYS.token);
};

export const clearLegacyAuthKeys = (): void => {
  for (const key of LEGACY_KEYS) {
    localStorage.removeItem(key);
  }
};