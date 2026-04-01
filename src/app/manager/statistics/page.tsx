import RoleGuard from "@/components/RoleGuard";
import ManagerStatistics from "@/app/manager/components/ManagerStatistics";

export const dynamic = 'force-dynamic';

export default function ManagerStatisticsPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <ManagerStatistics />
    </RoleGuard>
  );
}
