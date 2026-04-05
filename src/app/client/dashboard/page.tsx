import RoleGuard from "@/components/RoleGuard";
import ClientDashboard from "@/app/client/components/ClientDashboard";


export default function ClientDashboardPage() {
  return (
    <RoleGuard allowedRoles={["client"]}>
      <ClientDashboard />
    </RoleGuard>
  );
}
