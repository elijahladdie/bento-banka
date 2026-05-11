/**
 * Mock API interceptor — intercepts all axios requests from apiClient
 * and returns mock data so the app works in sandbox without a backend.
 */
import {
  mockUsers,
  mockAccounts,
  mockTransactions,
  mockNotifications,
} from "@/data/mockData";
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

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

function buildStatsOverview() {
  return {
    activeUsers: mockUsers.filter((u) => u.status === "active").length,
    totalAccounts: mockAccounts.length,
    transactionCount: mockTransactions.length,
    transactionVolume: mockTransactions.reduce((sum, tx) => sum + (tx.amount ?? 0), 0),
    pendingApprovals: mockUsers.filter((u) => u.status === "pending_approval").length,
  };
}

function buildStatsTransactions() {
  const grouped = new Map<string, { amount: number; count: number }>();
  for (const tx of mockTransactions) {
    const current = grouped.get(tx.type) ?? { amount: 0, count: 0 };
    current.amount += tx.amount ?? 0;
    current.count += 1;
    grouped.set(tx.type, current);
  }

  return Array.from(grouped.entries()).map(([type, aggregate]) => ({
    type,
    _sum: { amount: aggregate.amount },
    _count: { id: aggregate.count },
  }));
}

function buildStatsAccounts() {
  const grouped = new Map<string, number>();
  for (const account of mockAccounts) {
    const key = `${account.type}::${account.status}`;
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  return Array.from(grouped.entries()).map(([key, count]) => {
    const [type, status] = key.split("::");
    return {
      type,
      status,
      _count: { id: count },
    };
  });
}

function buildStatsUsers() {
  const grouped = new Map<string, number>();
  for (const user of mockUsers) {
    for (const userRole of user.userRoles) {
      const role = userRole.role.slug;
      grouped.set(role, (grouped.get(role) ?? 0) + 1);
    }
  }

  return Array.from(grouped.entries()).map(([role, count]) => ({ role, count }));
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

  // STATS must be checked before generic resource routes
  if (url.includes("/stats/overview") && method === "get") return success(buildStatsOverview());
  if (url.includes("/stats/transactions") && method === "get") return success(buildStatsTransactions());
  if (url.includes("/stats/accounts") && method === "get") return success(buildStatsAccounts());
  if (url.includes("/stats/users") && method === "get") return success(buildStatsUsers());

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
    const token = String(Math.floor(1000 + Math.random() * 9000));
    const newTxn = {
      id: "txn_withdraw_" + Date.now(),
      type: "withdraw" as const,
      fromAccount: data?.fromAccount,
      toAccount: null,
      performedBy: getCurrentUser()?.id ?? "unknown",
      amount: amt,
      reference: "TXN-" + Date.now().toString(36).toUpperCase(),
      status: "pending" as const,
      confirmationToken: token,
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
    const ownerId = account?.ownerId ?? getCurrentUser()?.id ?? "unknown";
    mockNotifications.unshift({
      id: "notif_withdraw_code_" + Date.now(),
      type: "WITHDRAWAL_CODE_SENT",
      title: "Withdrawal Confirmation Code",
      message: `Use code ${token} to confirm the withdrawal for account ${account?.accountNumber ?? data?.fromAccount ?? ""}.`,
      isRead: false,
      readAt: null,
      userId: ownerId,
      direction: "RECEIVED",
      createdAt: new Date().toISOString(),
      metadata: {
        transactionId: newTxn.id,
        accountId: data?.fromAccount,
        accountNumber: account?.accountNumber,
        amount: amt,
        currency: "RWF",
        code: token,
      } as any,
    } as any);
    return success(
      {
        account: account ? { id: account.id, balance: account.balance } : null,
        transaction: { ...newTxn, confirmationToken: null },
        ownerId,
        accountNumber: account?.accountNumber,
      },
      "Withdrawal request submitted"
    );
  }

  if (url.includes("/transactions/confirm-withdrawal") && method === "post") {
    const txn = mockTransactions.find((tx) => tx.id === data?.transactionId && tx.type === "withdraw");
    if (!txn) {
      throw { response: { data: { success: false, resp_msg: "Transaction not found", resp_code: 101 }, status: 404 } };
    }
    if (txn.status !== "pending") {
      throw { response: { data: { success: false, resp_msg: "Transaction already processed", resp_code: 101 }, status: 400 } };
    }
    if (String((txn as any).confirmationToken ?? "") !== String(data?.confirmationCode ?? "")) {
      throw { response: { data: { success: false, resp_msg: "Invalid confirmation code", resp_code: 101 }, status: 400 } };
    }

    txn.status = "completed" as const;
    (txn as any).confirmationToken = null;
    mockNotifications.unshift({
      id: "notif_withdraw_done_" + Date.now(),
      type: "WITHDRAWAL_PROCESSED",
      title: "Withdrawal Processed",
      message: `A withdrawal of RWF ${txn.amount} has been debited from your account ${txn.fromAccount}.`,
      isRead: false,
      readAt: null,
      userId: getCurrentUser()?.id ?? "unknown",
      direction: "RECEIVED",
      createdAt: new Date().toISOString(),
    } as any);
    return success(
      {
        transaction: { ...txn, confirmationToken: null },
        sourceAccount: {
          ownerId: txn.performedBy,
          accountNumber: txn.fromAccount,
        },
      },
      "Withdrawal confirmed"
    );
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

  // NOTIFICATIONS
  if (url.includes("/notifications")) return success(mockNotifications);

  // Fallback
  return success(null, "Mock: unhandled route " + url);
}

/** Install mock interceptors on apiClient */
export function installMockApi(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const response = handleRequest(config);
    return Promise.reject({ __mockResponse: response, config }) as any;
  });

  // Response interceptor that catches our mock "errors" and returns them as successful responses
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.__mockResponse) {
        return Promise.resolve(error.__mockResponse);
      }
      if (error?.response) {
        return Promise.reject({ response: error.response, isAxiosError: true });
      }
      return Promise.reject(error);
    }
  );
}
