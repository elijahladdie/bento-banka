import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient, authStorage, extractErrorMessage } from "@/lib/api-client";
import type { RoleSlug, User } from "@/types";

export type AuthState = {
  user: User | null;
  token: string | null;
  role: RoleSlug | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
};

type HydrateAuthPayload = {
  token: string;
  user: User;
};

type ApiUser = User & {
  roles?: RoleSlug[];
};

const normalizeUser = (user: ApiUser): User => {
  const roles = user.userRoles?.length
    ? user.userRoles
    : (user.roles ?? []).map((role) => ({ roleId: undefined, role: { slug: role } }));

  return {
    ...user,
    userRoles: roles,
  };
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
  const rawRole = user?.userRoles?.[0]?.role?.slug ?? (user as ApiUser | null)?.roles?.[0];
  if (rawRole === "client" || rawRole === "cashier" || rawRole === "manager") {
    return rawRole;
  }
  return null;
};

type LoginResult = { token: string; user: User };

export const loginThunk = createAsyncThunk<LoginResult, { email: string; password: string }>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post("/auth/login", payload);
      const data = response.data?.data ?? response.data;
      const token = data.token as string;
      const user = normalizeUser(data.user as ApiUser);
      authStorage.setToken(token);
      authStorage.setUser(user);
      return { token, user };
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Invalid email or password"));
    }
  }
);

export const fetchMeThunk = createAsyncThunk<User>(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get("/auth/me");
      const data = response.data?.data ?? response.data;
      const user = normalizeUser((data.user ?? data) as ApiUser);
      authStorage.setUser(user);
      return user;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to fetch current user"));
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await apiClient.post("/auth/logout");
    authStorage.clearToken();
    authStorage.clearUser();
  } catch (error) {
    authStorage.clearToken();
    authStorage.clearUser();
    return rejectWithValue(extractErrorMessage(error, "Failed to logout"));
  }
});

export const updateProfileThunk = createAsyncThunk<
  User,
  {
    userId: string;
    data: {
      firstName: string;
      lastName?: string;
      phoneNumber?: string;
      profilePicture?: string;
      preferredLanguage?: "en" | "fr" | "kin";
    };
  }
>(
  "auth/updateProfile",
  async ({ data, userId }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/users/${userId}`, data);
      const responseData = response.data?.data ?? response.data;
      const user = normalizeUser((responseData.user ?? responseData) as ApiUser);
      authStorage.setUser(user);
      return user;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to update profile"));
    }
  }
);

export const changePasswordThunk = createAsyncThunk<
  void,
  { currentPassword: string; newPassword: string }
>(
  "auth/changePassword",
  async (payload, { rejectWithValue }) => {
    try {
      await apiClient.post("/auth/change-password", payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, "Failed to change password"));
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateAuthFromStorage: (state, action: { payload: HydrateAuthPayload }) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.role = normalizeRole(action.payload.user);
      state.isAuthenticated = true;
      state.error = null;
    },
    clearAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
    }
  },
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
      })
      .addCase(updateProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.role = normalizeRole(action.payload);
        state.error = null;
      })
      .addCase(updateProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload ?? "Failed to update profile");
      })
      .addCase(changePasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = String(action.payload ?? "Failed to change password");
      });
  }
});

export const { hydrateAuthFromStorage, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
