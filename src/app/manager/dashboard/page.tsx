import RoleGuard from "@/components/RoleGuard";
import ManagerDashboard from "@/app/manager/components/ManagerDashboard";

export const dynamic = 'force-dynamic';

export default function ManagerDashboardPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <ManagerDashboard />
    </RoleGuard>
  );
}
