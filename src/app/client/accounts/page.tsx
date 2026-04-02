import RoleGuard from "@/components/RoleGuard";
import ClientAccounts from "@/app/client/components/ClientAccounts";

export const dynamic = 'force-dynamic';

export default function ClientAccountsPage() {
  return (
    <RoleGuard allowedRoles={["client"]}>
      <ClientAccounts />
    </RoleGuard>
  );
}
