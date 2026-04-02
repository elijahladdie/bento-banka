"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import type { User } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginThunk, logoutThunk } from "@/store/slices/authSlice";
import { apiClient, extractErrorMessage } from "@/lib/api-client";

const normalizeRole = (user: User | null) => {
  const role = user?.userRoles?.[0]?.role?.slug;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  // On mount, try to restore user from localStorage (mock mode)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("banka_current_user");
      if (raw) {
        const user = JSON.parse(raw) as User;
        setLocalUser(user);
      }
    } catch {}
    setInitialized(true);
  }, []);

  // Sync from redux auth state
  const user = authState.user ?? localUser;
  const role = normalizeRole(user);
  const isAuthenticated = !!user;

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
    if (typeof window !== "undefined") {
      localStorage.removeItem("banka_current_user");
      localStorage.removeItem("banka_token");
    }
  }, [dispatch]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, role }}>
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
    };
  }
  return context;
};
