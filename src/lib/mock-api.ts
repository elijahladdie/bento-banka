/**
 * Mock API interceptor — intercepts all axios requests from apiClient
 * and returns mock data so the app works in sandbox without a backend.
 */
import { apiClient } from "./api-client";
import {
  mockUsers,
  mockAccounts,
  mockTransactions,
  mockNotifications,
  mockStatsOverview,
  mockStatsTransactions,
  mockStatsAccounts,
  mockStatsUsers,
} from "@/data/mockData";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

const TOKEN_KEY = "banka_token";
const CURRENT_USER_KEY = "banka_current_user";

function success<T>(data: T, message = "Success"): AxiosResponse<{ success: boolean; resp_msg: string; resp_code: number; data: T }> {
  return {
    data: { success: true, resp_msg: message, resp_code: 100, data },
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

function getCurrentUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function handleRequest(config: InternalAxiosRequestConfig): AxiosResponse {
  const url = config.url ?? "";
  const method = (config.method ?? "get").toLowerCase();
  const data = typeof config.data === "string" ? JSON.parse(config.data) : config.data;

  // AUTH
  if (url.includes("/auth/login") && method === "post") {
    const user = mockUsers.find((u) => u.email === data?.email);
    if (!user) throw { response: { data: { success: false, resp_msg: "Invalid email or password", resp_code: 101 }, status: 401 } };
    const token = "mock_jwt_token_" + user.id;
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    }
    return success({ token, user });
  }

  if (url.includes("/auth/me")) {
    const currentUser = getCurrentUser();
    if (!currentUser) throw { response: { data: { success: false, resp_msg: "Not authenticated", resp_code: 101 }, status: 401 } };
    return success({ user: currentUser });
  }

  if (url.includes("/auth/logout") && method === "post") {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
    }
    return success(null, "Logged out");
  }

  if (url.includes("/auth/register") && method === "post") {
    return success({ id: "usr_new_" + Date.now(), ...data, status: "pending_approval" }, "Registration successful");
  }

  if (url.includes("/auth/forgot-password") && method === "post") {
    return success(null, "Reset link sent");
  }

  // ACCOUNTS
  if (url.includes("/accounts") && !url.includes("/approve") && !url.includes("/reject") && method === "get") {
    return success(mockAccounts);
  }

  if (url.match(/\/accounts\/[^/]+\/approve/) && method === "patch") {
    const id = url.split("/accounts/")[1]?.split("/")[0];
    const account = mockAccounts.find((a) => a.id === id);
    if (account) account.status = "Active";
    return success(account ?? null, "Account approved");
  }

  if (url.match(/\/accounts\/[^/]+\/reject/) && method === "patch") {
    return success(null, "Account rejected");
  }

  // TRANSACTIONS
  if (url.includes("/transactions") && !url.includes("/transfer") && !url.includes("/deposit") && !url.includes("/withdraw") && method === "get") {
    return success(mockTransactions);
  }

  if (url.includes("/transactions/transfer") && method === "post") {
    const newTxn = {
      id: "txn_transfer_" + Date.now(),
      type: "transfer" as const,
      fromAccount: data?.fromAccount,
      toAccount: data?.toAccount,
      performedBy: getCurrentUser()?.id ?? "unknown",
      amount: data?.amount ?? 0,
      reference: "TXN-" + Date.now().toString(36).toUpperCase(),
      status: "completed" as const,
      description: data?.description ?? "Transfer",
      balanceBefore: 0,
      balanceAfter: 0,
      currency: "RWF",
      fee: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTransactions.unshift(newTxn);
    return success(newTxn, "Transfer successful");
  }

  if (url.includes("/transactions/deposit") && method === "post") {
    const account = mockAccounts.find((a) => a.id === data?.toAccount);
    const amt = data?.amount ?? 0;
    const newTxn = {
      id: "txn_deposit_" + Date.now(),
      type: "deposit" as const,
      fromAccount: null,
      toAccount: data?.toAccount,
      performedBy: getCurrentUser()?.id ?? "unknown",
      amount: amt,
      reference: "TXN-" + Date.now().toString(36).toUpperCase(),
      status: "completed" as const,
      description: data?.description ?? "Deposit",
      balanceBefore: account ? account.balance : 0,
      balanceAfter: account ? account.balance + amt : amt,
      currency: "RWF",
      fee: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (account) account.balance += amt;
    mockTransactions.unshift(newTxn);
    return success(newTxn, "Deposit successful");
  }

  if (url.includes("/transactions/withdraw") && method === "post") {
    const account = mockAccounts.find((a) => a.id === data?.fromAccount);
    const amt = data?.amount ?? 0;
    if (account && account.balance < amt) {
      throw { response: { data: { success: false, resp_msg: "Insufficient funds", resp_code: 101 }, status: 400 } };
    }
    const newTxn = {
      id: "txn_withdraw_" + Date.now(),
      type: "withdraw" as const,
      fromAccount: data?.fromAccount,
      toAccount: null,
      performedBy: getCurrentUser()?.id ?? "unknown",
      amount: amt,
      reference: "TXN-" + Date.now().toString(36).toUpperCase(),
      status: "completed" as const,
      description: data?.description ?? "Withdrawal",
      balanceBefore: account ? account.balance : 0,
      balanceAfter: account ? account.balance - amt : 0,
      currency: "RWF",
      fee: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (account) account.balance -= amt;
    mockTransactions.unshift(newTxn);
    return success(newTxn, "Withdrawal successful");
  }

  // USERS
  if (url.includes("/users") && !url.includes("/status") && method === "get") {
    return success(mockUsers);
  }

  if (url.match(/\/users\/[^/]+\/status/) && method === "patch") {
    const id = url.split("/users/")[1]?.split("/")[0];
    const user = mockUsers.find((u) => u.id === id);
    if (user && data?.status) {
      (user as any).status = data.status;
    }
    return success({ id, status: data?.status }, "User status updated");
  }

  // STATS
  if (url.includes("/stats/overview")) return success(mockStatsOverview);
  if (url.includes("/stats/transactions")) return success(mockStatsTransactions);
  if (url.includes("/stats/accounts")) return success(mockStatsAccounts);
  if (url.includes("/stats/users")) return success(mockStatsUsers);

  // NOTIFICATIONS
  if (url.includes("/notifications")) return success(mockNotifications);

  // Fallback
  return success(null, "Mock: unhandled route " + url);
}

/** Install mock interceptors on apiClient */
export function installMockApi() {
  // Request interceptor that short-circuits and never actually sends to network
  apiClient.interceptors.request.use((config) => {
    const response = handleRequest(config);
    // We throw a special "cancel" with the response attached
    // The response interceptor will catch it
    return Promise.reject({ __mockResponse: response, config }) as any;
  });

  // Response interceptor that catches our mock "errors" and returns them as successful responses
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.__mockResponse) {
        return Promise.resolve(error.__mockResponse);
      }
      // Real error from mock handler (e.g. auth failure)
      if (error?.response) {
        return Promise.reject({ response: error.response, isAxiosError: true });
      }
      return Promise.reject(error);
    }
  );
}
