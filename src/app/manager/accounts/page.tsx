import RoleGuard from "@/components/RoleGuard";
import ManagerAccounts from "@/app/manager/components/ManagerAccounts";

export const dynamic = 'force-dynamic';

export default function ManagerAccountsPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <ManagerAccounts />
    </RoleGuard>
  );
}
