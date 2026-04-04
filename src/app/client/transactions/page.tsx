import RoleGuard from "@/components/RoleGuard";
import ClientTransactions from "@/app/client/components/ClientTransactions";

export const dynamic = 'force-dynamic';

export default function ClientTransferPage() {
  return (
    <RoleGuard allowedRoles={["client"]}>
      <ClientTransactions />
    </RoleGuard>
  );
}
