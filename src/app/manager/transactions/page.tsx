import RoleGuard from "@/components/RoleGuard";
import ManagerTransactions from "@/app/manager/components/ManagerTransactions";

export const dynamic = 'force-dynamic';

export default function ManagerTransactionsPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <ManagerTransactions />
    </RoleGuard>
  );
}
