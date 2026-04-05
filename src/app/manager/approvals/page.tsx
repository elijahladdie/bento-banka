import RoleGuard from "@/components/RoleGuard";
import ManagerApprovals from "@/app/manager/components/ManagerApprovals";


export default function ManagerApprovalsPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <ManagerApprovals />
    </RoleGuard>
  );
}
