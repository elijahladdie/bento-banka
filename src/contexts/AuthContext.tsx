"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import type { User } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthState, hydrateAuthFromStorage, loginThunk, logoutThunk } from "@/store/slices/authSlice";
import { authStorage } from "@/lib/api-client";

const normalizeRole = (user: User | null) => {
  const role = user?.userRoles?.[0]?.role?.slug ?? (user as User & { roles?: string[] } | null)?.roles?.[0];
  if (role === "client" || role === "cashier" || role === "manager") {
    return role;
  }
  return null;
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; role?: string | null; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  role: string | null;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Restore session from storage once on app load.
  useEffect(() => {
    try {
      const token = authStorage.getToken();
      const storedUser = authStorage.getUser();

      if (token && storedUser) {
        const user = storedUser as User;
        setLocalUser(user);
        if (!authState.user) {
          dispatch(hydrateAuthFromStorage({ token, user }));
        }
      } else {
        setLocalUser(null);
        authStorage.clearToken();
        authStorage.clearUser();
        if (authState.user || authState.token) {
          dispatch(clearAuthState());
        }
      }
    } catch {
      setLocalUser(null);
      authStorage.clearToken();
      authStorage.clearUser();
      dispatch(clearAuthState());
    }
    setInitialized(true);
  }, [authState.token, authState.user, dispatch]);

  // Keep local shadow user synchronized from redux after login/me fetch.
  useEffect(() => {
    if (authState.user) {
      setLocalUser(authState.user);
    }
  }, [authState.user]);

  // Sync from redux auth state
  const user = authState.user ?? localUser;
  const role = normalizeRole(user);
  const isAuthenticated = !!(authState.token ?? authStorage.getToken());

  const login = useCallback(
    async (email: string, password: string) => {
      const action = await dispatch(loginThunk({ email, password }));

      if (loginThunk.fulfilled.match(action)) {

        const nextUser = action.payload.user;
        setLocalUser(nextUser);
        if (nextUser.status === "pending_approval") {
          return { success: false, error: "Your account is pending approval" };
        }
        if (nextUser.status === "inactive") {
          return { success: false, error: "Your account has been deactivated" };
        }
        return { success: true, role: normalizeRole(nextUser) };
      }

      return { success: false, error: String(action.payload ?? "Login failed") };
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutThunk());
    setLocalUser(null);
    authStorage.clearUser();
    authStorage.clearToken();
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, role, initialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      login: async () => ({ success: false, error: "Not authenticated" }),
      logout: () => {},
      isAuthenticated: false,
      role: null,
      initialized: false,
    };
  }
  return context;
};
