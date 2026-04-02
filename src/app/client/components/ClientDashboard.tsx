"use client";

import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/format";
import { CreditCard, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Bell, Plus } from "lucide-react";
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

const ClientDashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { accounts: allAccounts, transactions } = useAppSelector((state) => state.banking);
  const router = useRouter();
  const { t } = useUiText();

  useEffect(() => {
    dispatch(fetchAccountsThunk({}));
    dispatch(fetchTransactionsThunk({ limit: 10 }));
  }, [dispatch]);

  const accounts = allAccounts.filter((account) => account.ownerId === user?.id);
  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
  const accountIds = new Set(accounts.map((account) => account.id));
  const recentTxns = transactions
    .filter((txn) => accountIds.has(String(txn.fromAccount)) || accountIds.has(String(txn.toAccount)))
    .slice(0, 5);

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return t("dashboard.client.greetingMorning", "Good morning");
    if (h < 18) return t("dashboard.client.greetingAfternoon", "Good afternoon");
    return t("dashboard.client.greetingEvening", "Good evening");
  };

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
            <GlassButton variant="secondary" onClick={() => router.push("/client/profile")}>
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
              <button className="text-xs text-primary hover:underline">{t("dashboard.client.viewAll", "View All")}</button>
            </div>
            <div className="space-y-2">
              {recentTxns.map((t) => (
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
              <GlassButton variant="secondary" className="gap-1"><Plus className="h-3.5 w-3.5" /> {t("dashboard.client.new", "New")}</GlassButton>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map((a) => (
                <div key={a.id} className="glass-card rounded-xl p-4 cursor-pointer" onClick={() => router.push("/client/accounts")}>
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

          <BentoItem size="small">
            <GlassCard className="h-full">
            <h3 className="font-semibold text-foreground mb-3">{t("dashboard.client.quickTransfer", "Quick Transfer")}</h3>
            <div className="space-y-3">
              <GlassSelect
                options={accounts.filter((a) => a.status === "Active").map((a) => ({ value: a.id, label: `••••${a.accountNumber.slice(-4)} — ${formatCurrency(Number(a.balance))}` }))}
                placeholder={t("dashboard.client.selectSource", "Select source account")}
              />
              <GlassInput placeholder={t("dashboard.client.destination", "Destination account number")} />
              <GlassInput type="number" placeholder={t("dashboard.client.amount", "Amount")} />
              <GlassButton fullWidth>{t("dashboard.client.transfer", "Transfer")}</GlassButton>
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
    </DashboardLayout>
  );
};

export default ClientDashboard;
