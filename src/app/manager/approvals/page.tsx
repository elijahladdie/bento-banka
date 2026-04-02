import RoleGuard from "@/components/RoleGuard";
import ManagerApprovals from "@/app/manager/components/ManagerApprovals";

export const dynamic = 'force-dynamic';

export default function ManagerApprovalsPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <ManagerApprovals />
    </RoleGuard>
  );
}
