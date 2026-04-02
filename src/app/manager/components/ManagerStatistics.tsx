"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { formatCurrency } from "@/lib/format";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAccountsThunk, fetchStatsThunk, fetchTransactionsThunk, fetchUsersThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";

const ManagerStatistics = () => {
  const dispatch = useAppDispatch();
  const { transactions, users, accounts, statsTransactions, statsUsers } = useAppSelector((state) => state.banking);

  useEffect(() => {
    dispatch(fetchTransactionsThunk({ limit: 200 }));
    dispatch(fetchUsersThunk({ limit: 200 }));
    dispatch(fetchAccountsThunk({ limit: 200 }));
    dispatch(fetchStatsThunk());
  }, [dispatch]);

  const completedTransactions = transactions.filter((transaction) => transaction.status === "completed");
  const totalDeposits = completedTransactions
    .filter((transaction) => transaction.type === "deposit")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const totalWithdrawals = completedTransactions
    .filter((transaction) => transaction.type === "withdraw")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const totalTransfers = completedTransactions
    .filter((transaction) => transaction.type === "transfer")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);

  const savingAccounts = accounts.filter((account) => account.type === "saving").length;
  const fixedAccounts = accounts.filter((account) => account.type === "fixed").length;

  const roleCount = (role: string) =>
    statsUsers.find((item) => item.role === role)?.count ??
    users.filter((user) => user.userRoles?.[0]?.role?.slug === role).length;

  const clientCount = roleCount("client");
  const cashierCount = roleCount("cashier");
  const managerCount = roleCount("manager");

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Statistics</h1>

        {/* Volume by type */}
        <div className="bento-grid">
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold text-foreground">Deposits</h3>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalDeposits)}</p>
            <p className="text-xs text-muted-foreground mt-1">{statsTransactions.find((item) => item.type === "deposit")?._count.id ?? transactions.filter((t) => t.type === "deposit").length} transactions</p>
            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: "75%" }} />
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-foreground">Withdrawals</h3>
            </div>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(totalWithdrawals)}</p>
            <p className="text-xs text-muted-foreground mt-1">{statsTransactions.find((item) => item.type === "withdraw")?._count.id ?? transactions.filter((t) => t.type === "withdraw").length} transactions</p>
            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-destructive rounded-full" style={{ width: "40%" }} />
            </div>
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h3 className="font-semibold text-foreground">Transfers</h3>
            </div>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalTransfers)}</p>
            <p className="text-xs text-muted-foreground mt-1">{statsTransactions.find((item) => item.type === "transfer")?._count.id ?? transactions.filter((t) => t.type === "transfer").length} transactions</p>
            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-blue-400 rounded-full" style={{ width: "55%" }} />
            </div>
          </GlassCard>
        </div>

        {/* Account & User breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Account Types</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Savings", count: savingAccounts, color: "bg-primary", pct: (savingAccounts / (accounts.length || 1)) * 100 },
                { label: "Fixed Deposit", count: fixedAccounts, color: "bg-blue-400", pct: (fixedAccounts / (accounts.length || 1)) * 100 }
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
          </GlassCard>
          <GlassCard>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">User Roles</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Clients", count: clientCount, color: "bg-primary", pct: (clientCount / (users.length || 1)) * 100 },
                { label: "Cashiers", count: cashierCount, color: "bg-amber-400", pct: (cashierCount / (users.length || 1)) * 100 },
                { label: "Managers", count: managerCount, color: "bg-emerald-400", pct: (managerCount / (users.length || 1)) * 100 }
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
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerStatistics;
