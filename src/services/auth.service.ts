import { DASHBOARD_ROUTES } from "@/constants/routes";
import { RoleSlug } from "@/types";

export function getDashboardRouteByRole(role: RoleSlug | null): string {
  if (role === "manager") return DASHBOARD_ROUTES.manager;
  if (role === "cashier") return DASHBOARD_ROUTES.cashier;
  return DASHBOARD_ROUTES.client;
}
