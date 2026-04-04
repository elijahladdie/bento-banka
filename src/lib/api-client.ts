import axios, { AxiosError } from "axios";
import type { ApiError, ApiSuccess } from "@/types";
import { installMockApi } from "./mock-api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
const TOKEN_STORAGE_KEY = "banka_token";
const USER_STORAGE_KEY = "banka_user";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

let mockInstalled = false;
const frontendState = (
  process.env.FRONTEND_STATE ?? "client"
).toLowerCase();

const isSandboxMode = frontendState === "sandbox";

if (!mockInstalled && isSandboxMode && typeof window !== "undefined") {
  installMockApi(apiClient);
  mockInstalled = true;
}

// Note: token interceptor kept but mock-api interceptor will short-circuit before network

export const unwrapSuccess = <T>(payload: any): T => {
  // Handle both { data: T } and direct T formats from mock
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }
  return payload as T;
};

export const extractErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  console.log(error, "Error object");
  if (error && typeof error === "object" && "response" in error) {
    const responseData = (error as any).response?.data;
    console.log("API Error Response Data:", responseData);
    return responseData?.message ?? responseData?.error ?? fallback;
  }
  if(error && typeof error === "object" && "message" in error) {
    return (error as any).message ?? fallback;
  }
  if (typeof error === "string") {
    return error;
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
  },
  setUser(user: any) {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  },
  clearUser() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  },
  getUser() {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
  }
};
