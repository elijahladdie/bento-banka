import RoleGuard from "@/components/RoleGuard";
import NotificationsPageContent from "@/app/notifications/NotificationsPageContent";

export const dynamic = "force-dynamic";

export default function NotificationsPage() {
  return (
    <RoleGuard allowedRoles={["client", "cashier", "manager"]}>
      <NotificationsPageContent />
    </RoleGuard>
  );
}
