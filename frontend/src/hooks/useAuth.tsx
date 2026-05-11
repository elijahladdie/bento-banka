"use client";

/**
 * This hook re-exports from AuthContext to unify the two auth systems.
 * Components that import from @/hooks/useAuth will get the same context.
 */
import { useAuth as useAuthContext, AuthProvider } from "@/contexts/AuthContext";

export { AuthProvider };
export function useAuth() {
  return useAuthContext();
}
