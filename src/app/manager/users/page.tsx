import RoleGuard from "@/components/RoleGuard";
import ManagerUsers from "@/app/manager/components/ManagerUsers";

export const dynamic = 'force-dynamic';

export default function ManagerUsersPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <ManagerUsers />
    </RoleGuard>
  );
}
