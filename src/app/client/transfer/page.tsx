import RoleGuard from "@/components/RoleGuard";
import ClientTransfer from "@/app/client/components/ClientTransfer";

export const dynamic = 'force-dynamic';

export default function ClientTransferPage() {
  return (
    <RoleGuard allowedRoles={["client"]}>
      <ClientTransfer />
    </RoleGuard>
  );
}
