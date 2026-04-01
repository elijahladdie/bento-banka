import { DASHBOARD_ROUTES } from "@/constants/routes";
import { RoleSlug } from "@/types";

export function getStoredUserRole(): RoleSlug | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = JSON.parse(localStorage.getItem("banka_user") || "{}");
  const role = stored?.userRoles?.[0]?.role?.slug;

  if (role === "client" || role === "cashier" || role === "manager") {
    return role;
  }

  return null;
}

export function getDashboardRouteByRole(role: RoleSlug | null): string {
  if (role === "manager") return DASHBOARD_ROUTES.manager;
  if (role === "cashier") return DASHBOARD_ROUTES.cashier;
  return DASHBOARD_ROUTES.client;
}
