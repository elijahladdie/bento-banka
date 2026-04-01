"use client";

import React, { createContext, useContext, useCallback, useEffect } from "react";
import type { User } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMeThunk, loginThunk, logoutThunk } from "@/store/slices/authSlice";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  role: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, role, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMeThunk());
  }, [dispatch]);

  const login = useCallback(
    async (email: string, password: string) => {
      const action = await dispatch(loginThunk({ email, password }));

      if (loginThunk.fulfilled.match(action)) {
        const nextUser = action.payload.user;
        if (nextUser.status === "pending_approval") {
          return { success: false, error: "Your account is pending approval" };
        }
        if (nextUser.status === "inactive") {
          return { success: false, error: "Your account has been deactivated" };
        }
        return { success: true };
      }

      return { success: false, error: String(action.payload ?? "Login failed") };
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutThunk());
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
    // Return a safe default when used outside provider (e.g., during SSR)
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
