"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/format";
import { CreditCard, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Bell, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAccountsThunk, fetchTransactionsThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import GlassSelect from "@/components/ui/GlassSelect";
import StatusBadge from "@/components/ui/StatusBadge";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { useUiText } from "@/lib/ui-text";
import PaginationBar from "@/components/ui/PaginationBar";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useMemo } from "react";

const ClientDashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { accounts: allAccounts, transactions } = useAppSelector((state) => state.banking);
  const router = useRouter();
  const { t } = useUiText();
  
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountsPage, setAccountsPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const accountsPageSize = 4;
  const transactionsPageSize = 5;

  useEffect(() => {
    dispatch(fetchAccountsThunk({}));
    dispatch(fetchTransactionsThunk({ limit: 10 }));
  }, [dispatch]);

  const accounts = allAccounts.filter((account) => account.ownerId === user?.id);
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const accountIds = new Set(accounts.map((account) => account.id));
  const recentTxns = transactions
    .filter((txn) => accountIds.has(String(txn.fromAccount)) || accountIds.has(String(txn.toAccount)))
    ;
  const paginatedRecentTxns = useMemo(() => {
    const start = (transactionsPage - 1) * transactionsPageSize;
    return recentTxns.slice(start, start + transactionsPageSize);
  }, [recentTxns, transactionsPage]);
  const paginatedAccounts = useMemo(() => {
    const start = (accountsPage - 1) * accountsPageSize;
    return accounts.slice(start, start + accountsPageSize);
  }, [accounts, accountsPage]);
  const totalAccountsPages = Math.max(Math.ceil(accounts.length / accountsPageSize), 1);
  const totalTransactionsPages = Math.max(Math.ceil(recentTxns.length / transactionsPageSize), 1);

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t("dashboard.client.greetingMorning", "Good morning");
    if (h < 18) return t("dashboard.client.greetingAfternoon", "Good afternoon");
    return t("dashboard.client.greetingEvening", "Good evening");
  };

  const handleViewAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    setDrawerOpen(true);
  };

  const selectedAccount = useMemo(
    () => allAccounts.find((a) => a.id === selectedAccountId) ?? null,
    [allAccounts, selectedAccountId]
  );

  const accountTransactions = useMemo(
    () =>
      selectedAccount
        ? transactions.filter(
            (txn) =>
              String(txn.fromAccount) === selectedAccount.id || String(txn.toAccount) === selectedAccount.id
          )
        : [],
    [selectedAccount, transactions]
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <BentoGrid>
          <BentoItem size="wide">
            <GlassCard className="h-full">
            <div className="flex items-center gap-4">
              <img src={user?.profilePicture} alt="" className="w-14 h-14 rounded-full ring-2 ring-primary/30 object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{getTimeGreeting()}, {user?.firstName}!</h1>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge value={user?.status || "inactive"} />
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="text-muted-foreground text-sm">
                    {accounts.length} {t("dashboard.client.accounts", "accounts")}
                  </span>
                </div>
              </div>
            </div>
            </GlassCard>
          </BentoItem>

          <BentoItem size="small">
            <GlassCard className="h-full">
            <div className="flex items-center gap-3 mb-2">
              <img src={user?.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-foreground text-sm">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <GlassButton variant="secondary" onClick={() => router.push("/profile")}>
              {t("dashboard.client.editProfile", "Edit Profile")}
            </GlassButton>
            </GlassCard>
          </BentoItem>

          <BentoItem size="small">
            <GlassCard className="h-full">
            <p className="text-sm text-muted-foreground mb-1">{t("dashboard.client.totalBalance", "Total Balance")}</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(totalBalance)}</p>
            <p className="text-xs text-muted-foreground mt-1">{t("dashboard.client.acrossAccounts", "Across")} {accounts.length} {t("dashboard.client.accounts", "accounts")}</p>
            </GlassCard>
          </BentoItem>

          <BentoItem size="wide">
            <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">{t("dashboard.client.recentActivity", "Recent Activity")}</h3>
              <button className="text-xs text-primary hover:underline" onClick={()=> router.push('transactions')}>{t("dashboard.client.viewAll", "View All")}</button>
            </div>
            <div className="space-y-2">
              {paginatedRecentTxns.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    {t.type === "deposit" && <ArrowDownRight className="h-4 w-4 text-emerald-400" />}
                    {t.type === "withdraw" && <ArrowUpRight className="h-4 w-4 text-destructive" />}
                    {t.type === "transfer" && <ArrowRightLeft className="h-4 w-4 text-blue-400" />}
                    <div>
                      <p className="text-sm text-foreground">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${t.type === "deposit" ? "text-emerald-400" : t.type === "withdraw" ? "text-destructive" : "text-blue-400"}`}>
                    {t.type === "deposit" ? "+" : "-"}{formatCurrency(Number(t.amount))}
                  </span>
                </div>
              ))}
              {recentTxns.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">{t("dashboard.client.noRecentTransactions", "No recent transactions")}</p>}
            </div>
            </GlassCard>
          </BentoItem>

          <BentoItem size="wide">
            <GlassCard className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">{t("dashboard.client.myAccounts", "My Accounts")}</h3>
              <GlassButton variant="secondary" className="gap-1 flex flex-row items-center" onClick={() => router.push("/client/accounts")}><Plus className="h-3.5 w-3.5" /> {t("dashboard.client.new", "New")}</GlassButton>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paginatedAccounts.map((a) => (
                <div key={a.id} className="glass-card rounded-xl p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleViewAccount(a.id)} >
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <StatusBadge value={a.status} />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">••••{a.accountNumber.slice(-4)}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">{a.type}</p>
                  <p className="text-lg font-bold text-primary mt-2">{formatCurrency(Number(a.balance))}</p>
                </div>
              ))}
            </div>
            </GlassCard>
          </BentoItem>
          <BentoItem size="full">
            <GlassCard>
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t("dashboard.client.notifications", "Notifications")}</h3>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center py-4">{t("dashboard.client.noNotifications", "No notifications yet")}</p>
          </div>
            </GlassCard>
          </BentoItem>
        </BentoGrid>
      </div>

      <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="fixed z-50 right-0 left-auto top-0 h-full w-full max-w-xl rounded-none border-r bg-background/95 backdrop-blur-xl">
          <DrawerHeader>
            <DrawerTitle>{t("dashboard.client.drawer.title", "Account Details")}</DrawerTitle>
            <DrawerDescription>
              {selectedAccount
                ? `${selectedAccount.accountNumber} • ${selectedAccount.type.toUpperCase()}`
                : t("dashboard.client.drawer.empty", "No account selected")}
            </DrawerDescription>
          </DrawerHeader>

          {selectedAccount ? (
            <div className="space-y-4 px-4 pb-6 overflow-y-auto flex-1">
              <GlassCard>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <p className="text-muted-foreground">{t("dashboard.client.drawer.account", "Account #")}</p>
                  <p className="font-mono text-foreground">{selectedAccount.accountNumber}</p>
                  <p className="text-muted-foreground">{t("dashboard.client.drawer.type", "Type")}</p>
                  <p className="capitalize text-foreground">{selectedAccount.type}</p>
                  <p className="text-muted-foreground">{t("dashboard.client.drawer.balance", "Balance")}</p>
                  <p className="text-primary font-semibold">{formatCurrency(Number(selectedAccount.balance))}</p>
                  <p className="text-muted-foreground">{t("dashboard.client.drawer.status", "Status")}</p>
                  <p>
                    <StatusBadge value={selectedAccount.status} />
                  </p>
                  <p className="text-muted-foreground">{t("dashboard.client.drawer.created", "Created")}</p>
                  <p className="text-foreground text-xs">
                    {new Date(selectedAccount.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </GlassCard>

              <div className="space-y-2">
                <h3 className="font-semibold text-foreground px-0">
                  {t("dashboard.client.drawer.history", "Transaction History")}
                </h3>
                {accountTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {accountTransactions.map((txn) => (
                      <div
                        key={txn.id}
                        className="glass-card rounded-lg p-3 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          {txn.type === "deposit" && (
                            <ArrowDownRight className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                          )}
                          {txn.type === "withdraw" && (
                            <ArrowUpRight className="h-4 w-4 text-destructive flex-shrink-0" />
                          )}
                          {txn.type === "transfer" && (
                            <ArrowRightLeft className="h-4 w-4 text-blue-400 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-foreground truncate">
                              {txn.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(txn.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-medium flex-shrink-0 ml-2 ${
                            txn.type === "deposit"
                              ? "text-emerald-400"
                              : txn.type === "withdraw"
                                ? "text-destructive"
                                : "text-blue-400"
                          }`}
                        >
                          {txn.type === "deposit" ? "+" : "-"}
                          {formatCurrency(Number(txn.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("dashboard.client.drawer.noTransactions", "No transactions yet")}
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
    </DashboardLayout>
  );
};

export default ClientDashboard;
