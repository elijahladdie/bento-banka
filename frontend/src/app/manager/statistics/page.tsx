import RoleGuard from "@/components/RoleGuard";
import ManagerStatistics from "@/app/manager/components/ManagerStatistics";


export default function ManagerStatisticsPage() {
  return (
    <RoleGuard allowedRoles={["manager"]}>
      <ManagerStatistics />
    </RoleGuard>
  );
}
