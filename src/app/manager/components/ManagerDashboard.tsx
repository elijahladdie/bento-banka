"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/format";
import { Users, CreditCard, ArrowRightLeft, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { approveAccountThunk, fetchAccountsThunk, fetchStatsThunk, fetchTransactionsThunk, fetchUsersThunk, updateUserStatusThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassTable from "@/components/ui/GlassTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { useUiText } from "@/lib/ui-text";

const ManagerDashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { users, accounts, transactions, statsOverview, statsUsers } = useAppSelector((state) => state.banking);
  const { t } = useUiText();

  useEffect(() => {
    dispatch(fetchUsersThunk({ limit: 200 }));
    dispatch(fetchAccountsThunk({ limit: 200 }));
    dispatch(fetchTransactionsThunk({ limit: 200 }));
    dispatch(fetchStatsThunk());
  }, [dispatch]);

  const clients = users.filter((u) => u.userRoles?.[0]?.role?.slug === "client" || (u as unknown as { roles?: string[] }).roles?.includes("client"));
  const pendingClients = clients.filter((c) => c.status === "pending_approval");
  const pendingAccounts = accounts.filter((a) => a.status === "Inactive");
  const totalVolume = transactions.filter((t) => t.status === "completed").reduce((s, t) => s + Number(t.amount), 0);

  const activeClients = statsUsers.find((item) => item.role === "client")?.count ?? clients.filter((c) => c.status === "active").length;

  const handleApproveClient = async (id: string) => {
    await dispatch(updateUserStatusThunk({ id, status: "active" }));
    dispatch(fetchUsersThunk({ limit: 200 }));
  };

  const handleRejectClient = async (id: string) => {
    await dispatch(updateUserStatusThunk({ id, status: "inactive" }));
    dispatch(fetchUsersThunk({ limit: 200 }));
  };

  const handleApproveAccount = async (id: string) => {
    await dispatch(approveAccountThunk(id));
    dispatch(fetchAccountsThunk({ limit: 200 }));
  };

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

          <BentoItem size="wide">
            <GlassCard>
              <h3 className="mb-3 font-semibold text-foreground">{t("dashboard.manager.recentTransactions", "Recent Transactions")}</h3>
              <GlassTable
                columns={[
                  { key: "reference", header: t("dashboard.manager.reference", "Reference") },
                  { key: "type", header: t("dashboard.manager.type", "Type"), render: (row) => <span className="capitalize">{row.type}</span> },
                  { key: "amount", header: t("dashboard.manager.amount", "Amount"), render: (row) => formatCurrency(Number(row.amount)) },
                  { key: "status", header: t("dashboard.manager.status", "Status"), render: (row) => <StatusBadge value={row.status} /> }
                ]}
                data={transactions.slice(0, 5).map((row) => ({ ...row, id: String(row.id) }))}
                emptyMessage={t("dashboard.manager.noTransactions", "No transactions")}
              />
            </GlassCard>
          </BentoItem>

          <BentoItem size="small">
            <GlassCard>
            <h3 className="font-semibold text-foreground mb-3">{t("dashboard.manager.pendingApprovals", "Pending Approvals")}</h3>
            <div className="space-y-3">
              {pendingClients.map((c) => (
                <div key={c.id} className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={c.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-muted-foreground">{t("dashboard.manager.newClientRegistration", "New client registration")}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <GlassButton variant="secondary" className="flex-1 text-xs" onClick={() => handleApproveClient(c.id)}>
                      <CheckCircle className="h-3 w-3" /> {t("dashboard.manager.approve", "Approve")}
                    </GlassButton>
                    <GlassButton variant="danger" className="flex-1 text-xs" onClick={() => handleRejectClient(c.id)}>
                      <XCircle className="h-3 w-3" /> {t("dashboard.manager.reject", "Reject")}
                    </GlassButton>
                  </div>
                </div>
              ))}
              {pendingAccounts.slice(0, 2).map((account) => (
                <div key={account.id} className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
                  <div className="mb-2">
                    <p className="text-sm font-medium text-foreground">{account.owner?.firstName} {account.owner?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{account.type} account • {account.accountNumber}</p>
                  </div>
                  <GlassButton variant="secondary" fullWidth className="text-xs" onClick={() => handleApproveAccount(account.id)}>
                    <CheckCircle className="h-3 w-3" /> {t("dashboard.manager.approveAccount", "Approve Account")}
                  </GlassButton>
                </div>
              ))}
              {pendingClients.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t("dashboard.manager.noPendingApprovals", "No pending approvals")}</p>}
            </div>
            </GlassCard>
          </BentoItem>

          <BentoItem size="full">
            <GlassCard>
              <h3 className="mb-3 font-semibold text-foreground">{t("dashboard.manager.allUsers", "All Users")}</h3>
              <GlassTable
                columns={[
                  {
                    key: "user",
                    header: t("dashboard.manager.user", "User"),
                    render: (u) => (
                      <div className="flex items-center gap-2">
                        <img src={u.profilePicture} alt="" className="h-7 w-7 rounded-full object-cover" />
                        <span className="font-medium text-foreground">{u.firstName} {u.lastName}</span>
                      </div>
                    )
                  },
                  { key: "email", header: t("dashboard.manager.email", "Email") },
                  {
                    key: "role",
                    header: t("dashboard.manager.role", "Role"),
                    render: (u) => (
                      <span className="capitalize">{u.userRoles?.[0]?.role?.name ?? u.userRoles?.[0]?.role?.slug ?? (u as unknown as { roles?: string[] }).roles?.[0]}</span>
                    )
                  },
                  { key: "status", header: t("dashboard.manager.status", "Status"), render: (u) => <StatusBadge value={u.status} /> },
                  { key: "createdAt", header: t("dashboard.manager.joined", "Joined"), render: (u) => new Date(u.createdAt).toLocaleDateString() }
                ]}
                data={users.map((u) => ({ ...u, id: String(u.id) }))}
                emptyMessage={t("dashboard.manager.noUsers", "No users found")}
              />
            </GlassCard>
          </BentoItem>
        </BentoGrid>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
