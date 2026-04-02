import RoleGuard from "@/components/RoleGuard";
import CashierClients from "@/app/cashier/components/CashierClients";

export const dynamic = 'force-dynamic';

export default function CashierClientsPage() {
  return (
    <RoleGuard allowedRoles={["cashier"]}>
      <CashierClients />
    </RoleGuard>
  );
}
