"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { mockAccounts, formatCurrency, getStatusBadgeClass } from "@/data/mockData";
import { Search, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { searchClientUsers } from "@/services/banking.service";

const CashierClients = () => {
  const [search, setSearch] = useState("");

  const clients = searchClientUsers(search);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Search Clients</h1>
        <div className="bento-card">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary border-border" />
          </div>
          {search && (
            <div className="bento-grid">
              {clients.map((c) => {
                const accs = mockAccounts.filter((a) => a.ownerId === c.id);
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
                    <p className="text-xs text-muted-foreground mb-2">{accs.length} account(s)</p>
                    {accs.filter((a) => a.status === "Active").map((a) => (
                      <div key={a.id} className="rounded-lg bg-card p-3 mb-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-mono text-muted-foreground">{a.accountNumber}</p>
                          <p className="text-xs text-muted-foreground capitalize">{a.type} • {formatCurrency(a.balance)}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <Button variant="outline" size="sm" className="text-xs gap-1">
                            <ArrowDownRight className="h-3 w-3" /> Deposit
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs gap-1">
                            <ArrowUpRight className="h-3 w-3" /> Withdraw
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
              {clients.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-4">No clients found</p>}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CashierClients;
