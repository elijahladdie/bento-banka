import RoleGuard from "@/components/RoleGuard";
import ClientProfile from "@/app/client/components/ClientProfile";


export default function ClientProfilePage() {
  return (
    <RoleGuard allowedRoles={["client"]}>
      <ClientProfile />
    </RoleGuard>
  );
}
