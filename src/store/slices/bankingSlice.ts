import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, extractErrorMessage, unwrapSuccess } from "@/lib/api-client";
import type {
  Account,
  ApiSuccess,
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

export const fetchAccountsThunk = createAsyncThunk(
  "banking/accounts",
  async (params: Record<string, string | number | undefined> = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ApiSuccess<Account[]>>("/accounts", { params });
      return {
        items: unwrapSuccess(response.data),
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
      const response = await apiClient.get<ApiSuccess<Transaction[]>>("/transactions", { params });
      return {
        items: unwrapSuccess(response.data),
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
      const response = await apiClient.get<ApiSuccess<User[]>>("/users", { params });
      return {
        items: unwrapSuccess(response.data),
        pagination: response.data.pagination ?? null
      } as ListPayload<User>;
    } catch (error) {
      const message = extractErrorMessage(error, "Failed to fetch users");
      if (message === "No users found") {
        return {
          items: [],
          pagination: null
        } as ListPayload<User>;
      }

      return rejectWithValue(message);
    }
  }
);

export const fetchStatsThunk = createAsyncThunk("banking/stats", async (_, { rejectWithValue }) => {
  try {
    const [overviewResponse, txResponse, accountsResponse, usersResponse] = await Promise.all([
      apiClient.get<ApiSuccess<StatsOverview>>("/stats/overview"),
      apiClient.get<ApiSuccess<StatsTransactionSeries>>("/stats/transactions"),
      apiClient.get<ApiSuccess<StatsAccountSeries>>("/stats/accounts"),
      apiClient.get<ApiSuccess<StatsUserSeries>>("/stats/users")
    ]);

    return {
      overview: unwrapSuccess(overviewResponse.data),
      transactions: unwrapSuccess(txResponse.data),
      accounts: unwrapSuccess(accountsResponse.data),
      users: unwrapSuccess(usersResponse.data)
    };
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Failed to fetch statistics"));
  }
});

export const transferFundsThunk = createAsyncThunk(
  "banking/transfer",
  async (payload: { fromAccount: string; toAccount: string; amount: number; description: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiSuccess<unknown>>("/transactions/transfer", payload);
      return unwrapSuccess(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Transfer failed"));
    }
  }
);

export const depositFundsThunk = createAsyncThunk(
  "banking/deposit",
  async (payload: { toAccount: string; amount: number; description: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiSuccess<unknown>>("/transactions/deposit", payload);
      return unwrapSuccess(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Deposit failed"));
    }
  }
);

export const withdrawFundsThunk = createAsyncThunk(
  "banking/withdraw",
  async (payload: { fromAccount: string; amount: number; description: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiSuccess<unknown>>("/transactions/withdraw", payload);
      return unwrapSuccess(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Withdrawal failed"));
    }
  }
);

export const approveAccountThunk = createAsyncThunk("banking/approveAccount", async (id: string, { rejectWithValue }) => {
  try {
    const response = await apiClient.patch<ApiSuccess<Account>>(`/accounts/${id}/approve`, { reason: "Approved by manager" });
    return unwrapSuccess(response.data);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Failed to approve account"));
  }
});

export const rejectAccountThunk = createAsyncThunk(
  "banking/rejectAccount",
  async (payload: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch<ApiSuccess<Account>>(`/accounts/${payload.id}/reject`, {
        reason: payload.reason
      });
      return unwrapSuccess(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to reject account"));
    }
  }
);

export const updateUserStatusThunk = createAsyncThunk(
  "banking/userStatus",
  async (payload: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch<ApiSuccess<{ id: string; status: string }>>(`/users/${payload.id}/status`, {
        status: payload.status
      });
      return unwrapSuccess(response.data);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to update user status"));
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
