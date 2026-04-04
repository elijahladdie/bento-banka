import RoleGuard from "@/components/RoleGuard";
import UnifiedProfile from "@/components/profile/UnifiedProfile";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return (
    <RoleGuard allowedRoles={["client", "cashier", "manager"]}>
      <UnifiedProfile />
    </RoleGuard>
  );
}
