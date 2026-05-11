import RoleGuard from "@/components/RoleGuard";
import ClientTransactions from "@/app/client/components/ClientTransactions";


export default function ClientTransferPage() {
  return (
    <RoleGuard allowedRoles={["client"]}>
      <ClientTransactions />
    </RoleGuard>
  );
}
