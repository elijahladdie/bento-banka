import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { mockUsers, mockAccounts, mockTransactions, formatCurrency, getStatusBadgeClass } from "@/data/mockData";
import { Users, CreditCard, ArrowRightLeft, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const clients = mockUsers.filter((u) => u.userRoles.some((r) => r.role.slug === "client"));
  const pendingClients = clients.filter((c) => c.status === "pending_approval");
  const pendingAccounts = mockAccounts.filter((a) => a.status === "Inactive");
  const totalVolume = mockTransactions.filter((t) => t.status === "completed").reduce((s, t) => s + t.amount, 0);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* KPIs */}
        <div className="bento-grid-4">
          <div className="bento-card">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-xs text-emerald-400">+12%</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{clients.filter((c) => c.status === "active").length}</p>
            <p className="text-xs text-muted-foreground">Active Clients</p>
          </div>
          <div className="bento-card">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{mockAccounts.length}</p>
            <p className="text-xs text-muted-foreground">Total Accounts</p>
          </div>
          <div className="bento-card">
            <div className="flex items-center justify-between mb-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalVolume)}</p>
            <p className="text-xs text-muted-foreground">Transaction Volume</p>
          </div>
          <div className="bento-card">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="h-5 w-5 text-amber-400" />
              {(pendingClients.length + pendingAccounts.length) > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-xs font-bold flex items-center justify-center text-background">
                  {pendingClients.length + pendingAccounts.length}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{pendingClients.length + pendingAccounts.length}</p>
            <p className="text-xs text-muted-foreground">Pending Approvals</p>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Transactions */}
          <div className="bento-card lg:col-span-2">
            <h3 className="font-semibold text-foreground mb-3">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 font-medium">Reference</th>
                    <th className="text-left py-2 font-medium">Type</th>
                    <th className="text-left py-2 font-medium">Amount</th>
                    <th className="text-left py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.slice(0, 5).map((t) => (
                    <tr key={t.id} className="border-b border-border last:border-0">
                      <td className="py-2 font-mono text-xs">{t.reference}</td>
                      <td className="py-2 capitalize">{t.type}</td>
                      <td className="py-2 font-medium">{formatCurrency(t.amount)}</td>
                      <td className="py-2"><span className={getStatusBadgeClass(t.status)}>{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bento-card">
            <h3 className="font-semibold text-foreground mb-3">Pending Approvals</h3>
            <div className="space-y-3">
              {pendingClients.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-secondary/50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={c.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-muted-foreground">New client registration</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1 text-emerald-400 border-emerald-400/30 hover:bg-emerald-500/10">
                      <CheckCircle className="h-3 w-3" /> Approve
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10">
                      <XCircle className="h-3 w-3" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
              {pendingClients.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No pending approvals</p>}
            </div>
          </div>
        </div>

        {/* Users overview */}
        <div className="bento-card">
          <h3 className="font-semibold text-foreground mb-3">All Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">User</th>
                  <th className="text-left py-2 font-medium">Email</th>
                  <th className="text-left py-2 font-medium">Role</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <img src={u.profilePicture} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <span className="font-medium text-foreground">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="py-2 text-muted-foreground">{u.email}</td>
                    <td className="py-2 capitalize">{u.userRoles[0]?.role.name}</td>
                    <td className="py-2"><span className={getStatusBadgeClass(u.status)}>{u.status.replace("_", " ")}</span></td>
                    <td className="py-2 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
