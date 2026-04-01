"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { mockTransactions, mockUsers, mockAccounts, formatCurrency, getStatusBadgeClass } from "@/data/mockData";
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CashierDashboard = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const todayTxns = mockTransactions.filter((t) => t.performedBy === user?.id);
  const deposits = todayTxns.filter((t) => t.type === "deposit");
  const withdrawals = todayTxns.filter((t) => t.type === "withdraw");
  const totalVolume = todayTxns.reduce((s, t) => s + t.amount, 0);

  const clients = mockUsers.filter(
    (u) => u.userRoles.some((r) => r.role.slug === "client") &&
      (search ? (u.firstName + " " + u.lastName + " " + u.email).toLowerCase().includes(search.toLowerCase()) : false)
  );

  const handleDeposit = (accountId: string) => {
    alert(`Deposit processed for account ${accountId} (demo)`);
  };

  const handleWithdraw = (accountId: string) => {
    alert(`Withdrawal processed for account ${accountId} (demo)`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bento-card lg:col-span-2">
            <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.firstName}!</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge-active">Cashier</span>
              <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
          </div>
          <div className="bento-card">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-400">{deposits.length}</p>
                <p className="text-xs text-muted-foreground">Deposits</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{withdrawals.length}</p>
                <p className="text-xs text-muted-foreground">Withdrawals</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalVolume)}</p>
                <p className="text-xs text-muted-foreground">Volume</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bento-card">
          <h3 className="font-semibold text-foreground mb-3">Search Client</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or account number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary border-border"
            />
          </div>
          {search && (
            <div className="mt-3 space-y-2">
              {clients.length === 0 && <p className="text-sm text-muted-foreground">No clients found.</p>}
              {clients.map((c) => {
                const accs = mockAccounts.filter((a) => a.ownerId === c.id && a.status === "Active");
                return (
                  <div key={c.id} className="rounded-xl border border-border bg-secondary/50 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={c.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-foreground">{c.firstName} {c.lastName}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                      <span className={`ml-auto ${getStatusBadgeClass(c.status)}`}>{c.status.replace("_", " ")}</span>
                    </div>
                    {accs.length > 0 && (
                      <div className="space-y-2">
                        {accs.map((a) => (
                          <div key={a.id} className="rounded-lg bg-card p-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-mono text-muted-foreground">{a.accountNumber}</p>
                              <p className="text-xs text-muted-foreground capitalize">{a.type} • {formatCurrency(a.balance)}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleDeposit(a.id)} className="text-xs gap-1">
                                <ArrowDownRight className="h-3 w-3" /> Deposit
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleWithdraw(a.id)} className="text-xs gap-1">
                                <ArrowUpRight className="h-3 w-3" /> Withdraw
                              </Button>
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
        </div>

        {/* Recent Operations */}
        <div className="bento-card">
          <h3 className="font-semibold text-foreground mb-3">Recent Operations</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">Reference</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-left py-2 font-medium">Amount</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {todayTxns.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0">
                    <td className="py-2 font-mono text-xs">{t.reference}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        {t.type === "deposit" && <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />}
                        {t.type === "withdraw" && <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />}
                        {t.type === "transfer" && <ArrowRightLeft className="h-3.5 w-3.5 text-blue-400" />}
                        <span className="capitalize">{t.type}</span>
                      </div>
                    </td>
                    <td className="py-2 font-medium">{formatCurrency(t.amount)}</td>
                    <td className="py-2"><span className={getStatusBadgeClass(t.status)}>{t.status}</span></td>
                    <td className="py-2 text-muted-foreground text-xs">{new Date(t.createdAt).toLocaleString()}</td>
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

export default CashierDashboard;
