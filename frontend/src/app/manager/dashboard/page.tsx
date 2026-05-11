import RoleGuard from "@/components/RoleGuard";
import ManagerDashboard from "@/app/manager/components/ManagerDashboard";


export default function ManagerDashboardPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <ManagerDashboard />
    </RoleGuard>
  );
}
