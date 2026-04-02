import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, authStorage, extractErrorMessage, unwrapSuccess } from "@/lib/api-client";
import type { ApiSuccess, LoginPayload, RoleSlug, User } from "@/types";

export type AuthState = {
  user: User | null;
  token: string | null;
  role: RoleSlug | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  token: authStorage.getToken(),
  role: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

const normalizeRole = (user: User | null): RoleSlug | null => {
  const rawRole = user?.userRoles?.[0]?.role?.slug;

  if (rawRole === "client" || rawRole === "cashier" || rawRole === "manager") {
    return rawRole;
  }

  return null;
};

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<ApiSuccess<LoginPayload>>("/auth/login", payload);
      const data = unwrapSuccess(response.data);
      authStorage.setToken(data.token);
      return data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Invalid email or password"));
    }
  }
);

export const fetchMeThunk = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<ApiSuccess<User>>("/auth/me");
    return unwrapSuccess(response.data);
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error, "Failed to fetch current user"));
  }
});

export const logoutThunk = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await apiClient.post("/auth/logout");
    authStorage.clearToken();
  } catch (error) {
    authStorage.clearToken();
    return rejectWithValue(extractErrorMessage(error, "Failed to logout"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
       .addCase(loginThunk.fulfilled, (state, action) => {
         state.loading = false;
         state.token = action.payload.token;
         state.user = action.payload.user;
         state.role = normalizeRole(action.payload.user);
         state.isAuthenticated = true;
         state.error = null;
       })
       .addCase(loginThunk.rejected, (state, action) => {
         state.loading = false;
         state.error = String(action.payload ?? "Login failed");
         state.isAuthenticated = false;
       })
      .addCase(fetchMeThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
       .addCase(fetchMeThunk.fulfilled, (state, action) => {
         state.loading = false;
         state.user = action.payload;
         state.role = normalizeRole(action.payload);
         state.isAuthenticated = true;
         state.error = null;
       })
       .addCase(fetchMeThunk.rejected, (state, action) => {
         state.loading = false;
         state.user = null;
         state.role = null;
         state.isAuthenticated = false;
         state.error = String(action.payload ?? "Authentication failed");
       })
       .addCase(logoutThunk.fulfilled, (state) => {
         state.user = null;
         state.role = null;
         state.token = null;
         state.isAuthenticated = false;
       });
  }
});

export default authSlice.reducer;
