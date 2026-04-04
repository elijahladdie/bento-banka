"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/format";
import { Users, CreditCard, ArrowRightLeft, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchStatsThunk, fetchUsersThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import GlassTable from "@/components/ui/GlassTable";
import PaginationBar from "@/components/ui/PaginationBar";
import StatusBadge from "@/components/ui/StatusBadge";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { useUiText } from "@/lib/ui-text";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { users, accounts, transactions, statsOverview, statsUsers } = useAppSelector((state) => state.banking);
  const { t } = useUiText();
  const [transactionsPage, setTransactionsPage] = useState(1);

  const pageSize = 5;

  useEffect(() => {
    dispatch(fetchUsersThunk({ limit: 200 }));
    dispatch(fetchStatsThunk());
  }, [dispatch]);

  const clients = users.filter((u) => u.userRoles?.[0]?.role?.slug === "client" || (u as unknown as { roles?: string[] }).roles?.includes("client"));
  const pendingClients = clients.filter((c) => c.status === "pending_approval");
  const pendingAccounts = accounts.filter((a) => a.status === "Inactive");
  const totalVolume = transactions.filter((t) => t.status === "completed").reduce((s, t) => s + Number(t.amount), 0);

  const activeClients = statsUsers.find((item) => item.role === "client")?.count ?? clients.filter((c) => c.status === "active").length;
  const paginatedTransactions = useMemo(() => {
    const start = (transactionsPage - 1) * pageSize;
    return transactions.slice(start, start + pageSize);
  }, [transactions, transactionsPage]);
  const totalTransactionsPages = Math.ceil(transactions.length / pageSize);


  return (
    <DashboardLayout>
      <div className="space-y-4">
        <BentoGrid>
          <BentoItem size="small">
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-xs text-emerald-400">+12%</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{activeClients}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.manager.activeClients", "Active Clients")}</p>
            </GlassCard>
          </BentoItem>

          <BentoItem size="small">
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-2">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{statsOverview?.totalAccounts ?? accounts.length}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.manager.totalAccounts", "Total Accounts")}</p>
            </GlassCard>
          </BentoItem>

          <BentoItem size="small">
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalVolume)}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.manager.transactionVolume", "Transaction Volume")}</p>
            </GlassCard>
          </BentoItem>

          <BentoItem size="small">
            <GlassCard className="h-full">
              <div className="flex items-center justify-between mb-2">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                {(pendingClients.length + pendingAccounts.length) > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-xs font-bold flex items-center justify-center text-background">
                    {pendingClients.length + pendingAccounts.length}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-foreground">{pendingClients.length + pendingAccounts.length}</p>
              <p className="text-xs text-muted-foreground">{t("dashboard.manager.pendingApprovals", "Pending Approvals")}</p>
            </GlassCard>
          </BentoItem>

          <BentoItem size="full">
            <GlassCard>
              <h3 className="mb-3 font-semibold text-foreground">{t("dashboard.manager.recentTransactions", "Recent Transactions")}</h3>
              <GlassTable
                columns={[
                  { key: "reference", header: t("dashboard.manager.reference", "Reference") },
                  { key: "type", header: t("dashboard.manager.type", "Type"), render: (row) => <span className="capitalize">{row.type}</span> },
                  { key: "amount", header: t("dashboard.manager.amount", "Amount"), render: (row) => formatCurrency(Number(row.amount)) },
                  { key: "status", header: t("dashboard.manager.status", "Status"), render: (row) => <StatusBadge value={row.status} /> }
                ]}
                data={paginatedTransactions.map((row) => ({ ...row, id: String(row.id) }))}
                emptyMessage={t("dashboard.manager.noTransactions", "No transactions")}
              />
              <PaginationBar
                currentPage={transactionsPage}
                totalPages={totalTransactionsPages}
                total={transactions.length}
                limit={pageSize}
                onPageChange={setTransactionsPage}
              />
            </GlassCard>
          </BentoItem>
        </BentoGrid>

      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
