import RoleGuard from "@/components/RoleGuard";
import ManagerUsers from "@/app/manager/components/ManagerUsers";


export default function ManagerUsersPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <ManagerUsers />
    </RoleGuard>
  );
}
