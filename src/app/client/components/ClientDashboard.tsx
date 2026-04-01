"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, getStatusBadgeClass } from "@/data/mockData";
import { CreditCard, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Bell, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getClientAccounts, getClientNotifications, getClientRecentTransactions } from "@/services/banking.service";

const ClientDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const accounts = getClientAccounts(user?.id);
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const notifications = getClientNotifications(user?.id);
  const recentTxns = getClientRecentTransactions(user?.id);

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bento-card lg:col-span-2">
            <div className="flex items-center gap-4">
              <img src={user?.profilePicture} alt="" className="w-14 h-14 rounded-full ring-2 ring-primary/30 object-cover" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">{getTimeGreeting()}, {user?.firstName}!</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={getStatusBadgeClass(user?.status || "")}>{user?.status?.replace("_", " ")}</span>
                  <span className="text-muted-foreground text-sm">•</span>
                  <span className="text-muted-foreground text-sm">{accounts.length} account{accounts.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bento-card">
            <div className="flex items-center gap-3 mb-2">
              <img src={user?.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-semibold text-foreground text-sm">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <button onClick={() => router.push("/client/profile")} className="text-xs text-primary hover:underline">Edit Profile →</button>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bento-card">
            <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(totalBalance)}</p>
            <p className="text-xs text-muted-foreground mt-1">across {accounts.length} accounts</p>
          </div>
          <div className="bento-card lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-foreground">Recent Activity</h3>
              <button className="text-xs text-primary hover:underline">View All</button>
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
                    {t.type === "deposit" ? "+" : "-"}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
              {recentTxns.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>}
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bento-card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">My Accounts</h3>
              <Button variant="outline" size="sm" className="gap-1"><Plus className="h-3.5 w-3.5" /> New</Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map((a) => (
                <div key={a.id} className="rounded-xl border border-border bg-secondary/50 p-4 hover:bg-secondary transition-colors cursor-pointer" onClick={() => router.push("/client/accounts")}>
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className={getStatusBadgeClass(a.status)}>{a.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">••••{a.accountNumber.slice(-4)}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">{a.type}</p>
                  <p className="text-lg font-bold text-primary mt-2">{formatCurrency(a.balance)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bento-card">
            <h3 className="font-semibold text-foreground mb-3">Quick Transfer</h3>
            <div className="space-y-3">
              <select className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground">
                <option>Select source account</option>
                {accounts.filter((a) => a.status === "Active").map((a) => (
                  <option key={a.id} value={a.id}>••••{a.accountNumber.slice(-4)} — {formatCurrency(a.balance)}</option>
                ))}
              </select>
              <input placeholder="Destination account number" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
              <input type="number" placeholder="Amount" className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
              <Button variant="hero" className="w-full" size="sm">Transfer</Button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bento-card">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Notifications</h3>
          </div>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${n.isRead ? "bg-transparent" : "bg-primary/5"}`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.isRead ? "bg-muted" : "bg-primary"}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
