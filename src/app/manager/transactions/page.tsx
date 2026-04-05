import RoleGuard from "@/components/RoleGuard";
import ManagerTransactions from "@/app/manager/components/ManagerTransactions";


export default function ManagerTransactionsPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <ManagerTransactions />
    </RoleGuard>
  );
}
