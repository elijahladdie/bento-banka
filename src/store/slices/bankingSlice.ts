import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, extractErrorMessage } from "@/lib/api-client";
import type {
  Account,
  Notification,
  Pagination,
  StatsAccountSeries,
  StatsOverview,
  StatsTransactionSeries,
  StatsUserSeries,
  Transaction,
  User
} from "@/types";

type ListPayload<T> = {
  items: T[];
  pagination: Pagination | null;
};

export type BankingState = {
  accounts: Account[];
  users: User[];
  transactions: Transaction[];
  notifications: Notification[];
  statsOverview: StatsOverview | null;
  statsTransactions: StatsTransactionSeries;
  statsAccounts: StatsAccountSeries;
  statsUsers: StatsUserSeries;
  pagination: {
    accounts: Pagination | null;
    users: Pagination | null;
    transactions: Pagination | null;
  };
  loading: {
    accounts: boolean;
    users: boolean;
    transactions: boolean;
    stats: boolean;
  };
  error: string | null;
};

const initialState: BankingState = {
  accounts: [],
  users: [],
  transactions: [],
  notifications: [],
  statsOverview: null,
  statsTransactions: [],
  statsAccounts: [],
  statsUsers: [],
  pagination: {
    accounts: null,
    users: null,
    transactions: null
  },
  loading: {
    accounts: false,
    users: false,
    transactions: false,
    stats: false
  },
  error: null
};

const unwrap = <T>(responseData: any): T => {
  if (responseData && typeof responseData === "object" && "data" in responseData) {
    return responseData.data as T;
  }
  return responseData as T;
};

export const fetchAccountsThunk = createAsyncThunk(
  "banking/accounts",
  async (params: Record<string, string | number | undefined> = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/accounts", { params });
      return {
        items: unwrap<Account[]>(response.data),
        pagination: response.data.pagination ?? null
      } as ListPayload<Account>;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to fetch accounts"));
    }
  }
);

export const fetchTransactionsThunk = createAsyncThunk(
  "banking/transactions",
  async (params: Record<string, string | number | undefined> = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/transactions", { params });
      return {
        items: unwrap<Transaction[]>(response.data),
        pagination: response.data.pagination ?? null
      } as ListPayload<Transaction>;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to fetch transactions"));
    }
  }
);

export const fetchUsersThunk = createAsyncThunk(
  "banking/users",
  async (params: Record<string, string | number | undefined> = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/users", { params });
      return {
        items: unwrap<User[]>(response.data),
        pagination: response.data.pagination ?? null
      } as ListPayload<User>;
    } catch (error) {
      const message = extractErrorMessage(error, "Failed to fetch users");
      if (message === "No users found") {
        return { items: [], pagination: null } as ListPayload<User>;
      }
      return rejectWithValue(message);
    }
  }
);

export const fetchStatsThunk = createAsyncThunk("banking/stats", async (_, { rejectWithValue }) => {
  try {
    const [overviewResponse, txResponse, accountsResponse, usersResponse] = await Promise.all([
      apiClient.get("/stats/overview"),
      apiClient.get("/stats/transactions"),
      apiClient.get("/stats/accounts"),
      apiClient.get("/stats/users")
    ]);

    return {
      overview: unwrap<StatsOverview>(overviewResponse.data),
      transactions: unwrap<StatsTransactionSeries>(txResponse.data),
      accounts: unwrap<StatsAccountSeries>(accountsResponse.data),
      users: unwrap<StatsUserSeries>(usersResponse.data)
    };
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Failed to fetch statistics"));
  }
});

export const transferFundsThunk = createAsyncThunk(
  "banking/transfer",
  async (payload: { fromAccount: string; toAccount: string; amount: number; description: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/transactions/transfer", payload);
      return unwrap(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Transfer failed"));
    }
  }
);

export const depositFundsThunk = createAsyncThunk(
  "banking/deposit",
  async (payload: { toAccount: string; amount: number; description: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/transactions/deposit", payload);
      return unwrap(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Deposit failed"));
    }
  }
);

export const withdrawFundsThunk = createAsyncThunk(
  "banking/withdraw",
  async (payload: { fromAccount: string; amount: number; description: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/transactions/withdraw", payload);
      return unwrap(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Withdrawal failed"));
    }
  }
);

export const confirmWithdrawalThunk = createAsyncThunk(
  "banking/confirmWithdrawal",
  async (payload: { transactionId: string; confirmationCode: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/transactions/confirm-withdrawal", payload);
      return unwrap(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to confirm withdrawal"));
    }
  }
);

export const approveAccountThunk = createAsyncThunk(
  "banking/approveAccount",
  async (payload: { id: string; reason: string }, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch(`/accounts/${payload.id}/approve`, { reason: payload.reason });
    return unwrap<Account>(response.data);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Failed to approve account"));
  }
  }
);

export const rejectAccountThunk = createAsyncThunk(
  "banking/rejectAccount",
  async (payload: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/accounts/${payload.id}/reject`, { reason: payload.reason });
      return unwrap<Account>(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to reject account"));
    }
  }
);

export const updateAccountStatusThunk = createAsyncThunk(
  "banking/accountStatus",
  async (payload: { id: string; status: "Active" | "Inactive" | "Dormant"; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/accounts/${payload.id}/status`, {
        status: payload.status,
        reason: payload.reason
      });
      return unwrap<Account>(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to update account status"));
    }
  }
);

export const updateUserStatusThunk = createAsyncThunk(
  "banking/userStatus",
  async (payload: { id: string; status: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/users/${payload.id}/status`, {
        status: payload.status,
        reason: payload.reason,
      });
      return unwrap<{ id: string; status: string }>(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to update user status"));
    }
  }
);

export const createUserThunk = createAsyncThunk(
  "banking/createUser",
  async (
    payload: {
      firstName: string;
      lastName?: string;
      email: string;
      phoneNumber?: string;
      nationalId: string;
      password: string;
      age: number;
      roleSlug: "client" | "cashier" | "manager";
      profilePicture?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post("/users", payload);
      return unwrap<{ id: string; email: string; status: string; roles: string[] }>(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to create user"));
    }
  }
);

const bankingSlice = createSlice({
  name: "banking",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountsThunk.pending, (state) => {
        state.loading.accounts = true;
        state.error = null;
      })
      .addCase(fetchAccountsThunk.fulfilled, (state, action) => {
        state.loading.accounts = false;
        state.accounts = action.payload.items;
        state.pagination.accounts = action.payload.pagination;
      })
      .addCase(fetchAccountsThunk.rejected, (state, action) => {
        state.loading.accounts = false;
        state.error = String(action.payload ?? "Failed to fetch accounts");
      })
      .addCase(fetchTransactionsThunk.pending, (state) => {
        state.loading.transactions = true;
        state.error = null;
      })
      .addCase(fetchTransactionsThunk.fulfilled, (state, action) => {
        state.loading.transactions = false;
        state.transactions = action.payload.items;
        state.pagination.transactions = action.payload.pagination;
      })
      .addCase(fetchTransactionsThunk.rejected, (state, action) => {
        state.loading.transactions = false;
        state.error = String(action.payload ?? "Failed to fetch transactions");
      })
      .addCase(updateAccountStatusThunk.pending, (state) => {
        state.loading.accounts = true;
        state.error = null;
      })
      .addCase(updateAccountStatusThunk.fulfilled, (state) => {
        state.loading.accounts = false;
      })
      .addCase(updateAccountStatusThunk.rejected, (state, action) => {
        state.loading.accounts = false;
        state.error = String(action.payload ?? "Failed to update account status");
      })
      .addCase(fetchUsersThunk.pending, (state) => {
        state.loading.users = true;
        state.error = null;
      })
      .addCase(fetchUsersThunk.fulfilled, (state, action) => {
        state.loading.users = false;
        state.users = action.payload.items;
        state.pagination.users = action.payload.pagination;
      })
      .addCase(fetchUsersThunk.rejected, (state, action) => {
        state.loading.users = false;
        state.error = String(action.payload ?? "Failed to fetch users");
      })
      .addCase(createUserThunk.pending, (state) => {
        state.loading.users = true;
        state.error = null;
      })
      .addCase(createUserThunk.fulfilled, (state) => {
        state.loading.users = false;
      })
      .addCase(createUserThunk.rejected, (state, action) => {
        state.loading.users = false;
        state.error = String(action.payload ?? "Failed to create user");
      })
      .addCase(fetchStatsThunk.pending, (state) => {
        state.loading.stats = true;
        state.error = null;
      })
      .addCase(fetchStatsThunk.fulfilled, (state, action) => {
        state.loading.stats = false;
        state.statsOverview = action.payload.overview;
        state.statsTransactions = action.payload.transactions;
        state.statsAccounts = action.payload.accounts;
        state.statsUsers = action.payload.users;
      })
      .addCase(fetchStatsThunk.rejected, (state, action) => {
        state.loading.stats = false;
        state.error = String(action.payload ?? "Failed to fetch stats");
      });
  }
});

export default bankingSlice.reducer;
