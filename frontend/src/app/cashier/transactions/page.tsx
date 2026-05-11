import RoleGuard from "@/components/RoleGuard";
import CashierTransactions from "@/app/cashier/components/CashierTransactions";


export default function CashierTransactionsPage() {
  return (
    <RoleGuard allowedRoles={["cashier"]}>
      <CashierTransactions />
    </RoleGuard>
  );
}
