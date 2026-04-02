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

// Note: token interceptor kept but mock-api interceptor will short-circuit before network

export const unwrapSuccess = <T>(payload: any): T => {
  // Handle both { data: T } and direct T formats from mock
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }
  return payload as T;
};

export const extractErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (error && typeof error === "object" && "response" in error) {
    const responseData = (error as any).response?.data;
    return responseData?.resp_msg ?? responseData?.message ?? fallback;
  }
  if (error instanceof AxiosError) {
    const responseData = error.response?.data as ApiError | undefined;
    return responseData?.message ?? fallback;
  }
  return fallback;
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
