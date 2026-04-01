import RoleGuard from "@/components/RoleGuard";
import CashierDashboard from "@/app/cashier/components/CashierDashboard";

export const dynamic = 'force-dynamic';

export default function CashierDashboardPage() {
  return (
    <RoleGuard allowedRoles={["cashier"]}>
      <CashierDashboard />
    </RoleGuard>
  );
}
