import DashboardLayout from "@/components/DashboardLayout";
import { mockUsers, mockAccounts, getStatusBadgeClass } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

const ManagerApprovals = () => {
  const pendingClients = mockUsers.filter((u) => u.status === "pending_approval");
  const pendingAccounts = mockAccounts.filter((a) => a.status === "Inactive");

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Approvals</h1>

        <div className="bento-card">
          <h3 className="font-semibold text-foreground mb-4">Pending Client Registrations</h3>
          {pendingClients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No pending registrations</p>
          ) : (
            <div className="bento-grid">
              {pendingClients.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-secondary/50 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={c.profilePicture} alt="" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-foreground">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <p>Phone: {c.phoneNumber}</p>
                    <p>National ID: {c.nationalId}</p>
                    <p>Age: {c.age}</p>
                    <p>Registered: {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/10">
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bento-card">
          <h3 className="font-semibold text-foreground mb-4">Pending Account Requests</h3>
          {pendingAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No pending account requests</p>
          ) : (
            <div className="bento-grid">
              {pendingAccounts.map((a) => (
                <div key={a.id} className="rounded-xl border border-border bg-secondary/50 p-4">
                  <p className="font-medium text-foreground">{a.owner.firstName} {a.owner.lastName}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">{a.type} Account • {a.accountNumber}</p>
                  <p className="text-xs text-muted-foreground">Requested: {new Date(a.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/10">
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerApprovals;
