import RoleGuard from "@/components/RoleGuard";
import UnifiedProfile from "@/components/profile/UnifiedProfile";


export default function ProfilePage() {
  return (
    <RoleGuard allowedRoles={["client", "cashier", "manager"]}>
      <UnifiedProfile />
    </RoleGuard>
  );
}
