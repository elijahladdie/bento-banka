import axios, { AxiosError } from "axios";
import type { ApiError, ApiSuccess } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
const TOKEN_STORAGE_KEY = "banka_token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") {
    return config;
  }

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const unwrapSuccess = <T>(payload: ApiSuccess<T>): T => payload.data;

export const extractErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (!(error instanceof AxiosError)) {
    return fallback;
  }

  const responseData = error.response?.data as ApiError | undefined;
  return responseData?.message ?? fallback;
};

export const authStorage = {
  setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  },
  clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  },
  getToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(TOKEN_STORAGE_KEY);
  }
};
