import RoleGuard from "@/components/RoleGuard";
import CashierClients from "@/app/cashier/components/CashierClients";


export default function CashierClientsPage() {
  return (
    <RoleGuard allowedRoles={["cashier"]}>
      <CashierClients />
    </RoleGuard>
  );
}
