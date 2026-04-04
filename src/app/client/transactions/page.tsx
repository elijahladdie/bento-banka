import RoleGuard from "@/components/RoleGuard";
import ClientTransactionsWorkspace from "@/app/client/components/ClientTransactionsWorkspace";

export const dynamic = 'force-dynamic';

export default function ClientTransferPage() {
  return (
    <RoleGuard allowedRoles={["client"]}>
      <ClientTransactionsWorkspace />
    </RoleGuard>
  );
}
