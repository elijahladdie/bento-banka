"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const { isAuthenticated, role, initialized } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !initialized) return;

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.replace("/login");
    }
  }, [allowedRoles, initialized, isAuthenticated, role, router, isMounted]);

  // During SSR/build, show nothing (it's a protected route anyway)
  if (!isMounted || !initialized) {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null;
  }

  return <>{children}</>;
}
