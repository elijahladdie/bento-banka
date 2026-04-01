import DashboardLayout from "@/components/DashboardLayout";
import { mockTransactions, mockUsers, mockAccounts, formatCurrency } from "@/data/mockData";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";

const ManagerStatistics = () => {
  const totalDeposits = mockTransactions.filter((t) => t.type === "deposit" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = mockTransactions.filter((t) => t.type === "withdraw" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const totalTransfers = mockTransactions.filter((t) => t.type === "transfer" && t.status === "completed").reduce((s, t) => s + t.amount, 0);

  const savingAccounts = mockAccounts.filter((a) => a.type === "saving").length;
  const fixedAccounts = mockAccounts.filter((a) => a.type === "fixed").length;
  const checkingAccounts = mockAccounts.filter((a) => a.type === "checking").length;

  const clientCount = mockUsers.filter((u) => u.userRoles.some((r) => r.role.slug === "client")).length;
  const cashierCount = mockUsers.filter((u) => u.userRoles.some((r) => r.role.slug === "cashier")).length;
  const managerCount = mockUsers.filter((u) => u.userRoles.some((r) => r.role.slug === "manager")).length;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Statistics</h1>

        {/* Volume by type */}
        <div className="bento-grid">
          <div className="bento-card">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold text-foreground">Deposits</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalDeposits)}</p>
            <p className="text-xs text-muted-foreground mt-1">{mockTransactions.filter((t) => t.type === "deposit").length} transactions</p>
            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: "75%" }} />
            </div>
          </div>
          <div className="bento-card">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-foreground">Withdrawals</h3>
            </div>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(totalWithdrawals)}</p>
            <p className="text-xs text-muted-foreground mt-1">{mockTransactions.filter((t) => t.type === "withdraw").length} transactions</p>
            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-destructive rounded-full" style={{ width: "40%" }} />
            </div>
          </div>
          <div className="bento-card">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-foreground">Transfers</h3>
            </div>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalTransfers)}</p>
            <p className="text-xs text-muted-foreground mt-1">{mockTransactions.filter((t) => t.type === "transfer").length} transactions</p>
            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: "55%" }} />
            </div>
          </div>
        </div>

        {/* Account & User breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bento-card">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Account Types</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Savings", count: savingAccounts, color: "bg-primary", pct: (savingAccounts / mockAccounts.length) * 100 },
                { label: "Fixed Deposit", count: fixedAccounts, color: "bg-blue-400", pct: (fixedAccounts / mockAccounts.length) * 100 },
                { label: "Checking", count: checkingAccounts, color: "bg-emerald-400", pct: (checkingAccounts / mockAccounts.length) * 100 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{item.label}</span>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bento-card">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">User Roles</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Clients", count: clientCount, color: "bg-primary", pct: (clientCount / mockUsers.length) * 100 },
                { label: "Cashiers", count: cashierCount, color: "bg-amber-400", pct: (cashierCount / mockUsers.length) * 100 },
                { label: "Managers", count: managerCount, color: "bg-emerald-400", pct: (managerCount / mockUsers.length) * 100 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{item.label}</span>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerStatistics;
