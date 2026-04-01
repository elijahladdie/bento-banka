import React, { createContext, useContext, useState, useCallback } from "react";
import { User, mockUsers } from "@/data/mockData";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  role: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("banka_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, _password: string) => {
    const found = mockUsers.find((u) => u.email === email);
    if (!found) return { success: false, error: "Invalid email or password" };
    if (found.status === "pending_approval") return { success: false, error: "Your account is pending approval" };
    if (found.status === "inactive") return { success: false, error: "Your account has been deactivated" };
    setUser(found);
    localStorage.setItem("banka_user", JSON.stringify(found));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("banka_user");
  }, []);

  const role = user?.userRoles[0]?.role.slug ?? null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, role }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
