"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/format";
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { depositFundsThunk, fetchAccountsThunk, fetchTransactionsThunk, fetchUsersThunk, withdrawFundsThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import GlassTable from "@/components/ui/GlassTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { useUiText } from "@/lib/ui-text";

const CashierDashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { transactions, users, accounts } = useAppSelector((state) => state.banking);
  const [search, setSearch] = useState("");
  const { t } = useUiText();

  useEffect(() => {
    dispatch(fetchTransactionsThunk({ limit: 100 }));
    dispatch(fetchUsersThunk({ role: "client", limit: 100 }));
    dispatch(fetchAccountsThunk({ limit: 200 }));
  }, [dispatch]);

  const todayTxns = transactions.filter((t) => t.performedBy === user?.id);
  const deposits = todayTxns.filter((t) => t.type === "deposit");
  const withdrawals = todayTxns.filter((t) => t.type === "withdraw");
  const totalVolume = todayTxns.reduce((sum, txn) => sum + Number(txn.amount), 0);

  const clients = users.filter(
    (u) =>
      (u.userRoles?.[0]?.role?.slug === "client" || (u as unknown as { roles?: string[] }).roles?.includes("client")) &&
      (search ? `${u.firstName} ${u.lastName ?? ""} ${u.email}`.toLowerCase().includes(search.toLowerCase()) : false)
  );

  const handleDeposit = async (accountId: string) => {
    await dispatch(depositFundsThunk({ toAccount: accountId, amount: 1000, description: "Cashier deposit" }));
    dispatch(fetchTransactionsThunk({ limit: 100 }));
    dispatch(fetchAccountsThunk({ limit: 200 }));
  };

  const handleWithdraw = async (accountId: string) => {
    await dispatch(withdrawFundsThunk({ fromAccount: accountId, amount: 1000, description: "Cashier withdrawal" }));
    dispatch(fetchTransactionsThunk({ limit: 100 }));
    dispatch(fetchAccountsThunk({ limit: 200 }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <BentoGrid>
          <BentoItem size="wide">
            <GlassCard className="h-full">
            <h1 className="text-2xl font-bold text-foreground">{t("dashboard.cashier.welcome", "Welcome")}, {user?.firstName}!</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge value="cashier" />
              <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            </GlassCard>
          </BentoItem>

          <BentoItem size="small">
            <GlassCard className="h-full">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-400">{deposits.length}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.cashier.deposits", "Deposits")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{withdrawals.length}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.cashier.withdrawals", "Withdrawals")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalVolume)}</p>
                <p className="text-xs text-muted-foreground">{t("dashboard.cashier.volume", "Volume")}</p>
              </div>
            </div>
            </GlassCard>
          </BentoItem>

          <BentoItem size="full">
            <GlassCard>
          <h3 className="font-semibold text-foreground mb-3">{t("dashboard.cashier.searchClient", "Search Client")}</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <GlassInput
              placeholder={t("dashboard.cashier.searchPlaceholder", "Search by name, email, or account number...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {search && (
            <div className="mt-3 space-y-2">
              {clients.length === 0 && <p className="text-sm text-muted-foreground">{t("dashboard.cashier.noClientsFound", "No clients found")}</p>}
              {clients.map((c) => {
                const accs = accounts.filter((a) => a.ownerId === c.id && a.status === "Active");
                return (
                  <div key={c.id} className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={c.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-foreground">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                      <span className="ml-auto"><StatusBadge value={c.status} /></span>
                    </div>
                    {accs.length > 0 && (
                      <div className="space-y-2">
                        {accs.map((a) => (
                          <div key={a.id} className="rounded-lg border border-[var(--glass-border)] bg-[rgba(255,255,255,0.04)] p-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-mono text-muted-foreground">{a.accountNumber}</p>
                              <p className="text-xs text-muted-foreground capitalize">{a.type} • {formatCurrency(Number(a.balance))}</p>
                            </div>
                            <div className="flex gap-2">
                              <GlassButton variant="secondary" onClick={() => handleDeposit(a.id)} className="text-xs">
                                <ArrowDownRight className="h-3 w-3" /> {t("dashboard.cashier.deposit", "Deposit")}
                              </GlassButton>
                              <GlassButton variant="danger" onClick={() => handleWithdraw(a.id)} className="text-xs">
                                <ArrowUpRight className="h-3 w-3" /> {t("dashboard.cashier.withdraw", "Withdraw")}
                              </GlassButton>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
            </GlassCard>
          </BentoItem>

          <BentoItem size="full">
            <GlassCard>
              <h3 className="mb-3 font-semibold text-foreground">{t("dashboard.cashier.recentOperations", "Recent Operations")}</h3>
              <GlassTable
                columns={[
                  { key: "reference", header: t("dashboard.cashier.reference", "Reference") },
                  {
                    key: "type",
                    header: t("dashboard.cashier.type", "Type"),
                    render: (row) => (
                      <div className="flex items-center gap-1">
                        {row.type === "deposit" && <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />}
                        {row.type === "withdraw" && <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />}
                        {row.type === "transfer" && <ArrowRightLeft className="h-3.5 w-3.5 text-blue-400" />}
                        <span className="capitalize">{row.type}</span>
                      </div>
                    )
                  },
                  { key: "amount", header: t("dashboard.cashier.amount", "Amount"), render: (row) => formatCurrency(Number(row.amount)) },
                  { key: "status", header: t("dashboard.cashier.status", "Status"), render: (row) => <StatusBadge value={row.status} /> },
                  { key: "createdAt", header: t("dashboard.cashier.date", "Date"), render: (row) => new Date(row.createdAt).toLocaleString() }
                ]}
                data={todayTxns.map((row) => ({ ...row, id: String(row.id) }))}
                emptyMessage={t("dashboard.cashier.noOperations", "No operations yet")}
              />
            </GlassCard>
          </BentoItem>
        </BentoGrid>
      </div>
    </DashboardLayout>
  );
};

export default CashierDashboard;
