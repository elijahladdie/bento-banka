"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatCurrency, getStatusBadgeClass } from "@/lib/format";
import { Search, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAccountsThunk, fetchUsersThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";
import PaginationBar from "@/components/ui/PaginationBar";
import { useUiText } from "@/lib/ui-text";

const CashierClients = () => {
  const dispatch = useAppDispatch();
  const { users, accounts } = useAppSelector((state) => state.banking);
  const { t } = useUiText();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    dispatch(fetchUsersThunk({ role: "client", limit: 100 }));
    dispatch(fetchAccountsThunk({ limit: 200 }));
  }, [dispatch]);

  const clients = users.filter((user) => {
    const isClient = user.userRoles?.[0]?.role?.slug === "client" || (user as unknown as { roles?: string[] }).roles?.includes("client");
    const match = `${user.firstName} ${user.lastName ?? ""} ${user.email}`.toLowerCase().includes(search.toLowerCase());
    return isClient && match;
  });

  const totalPages = Math.ceil(clients.length / pageSize);
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return clients.slice(start, start + pageSize);
  }, [clients, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{t("nav.clients", "Search Clients")}</h1>
        <GlassCard>
          <div className="mb-4">
            <GlassInput
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-5 w-5 text-muted-foreground" />}
              iconPosition="left"
            />
          </div>
          {search && (
            <div className="bento-grid">
              {paginatedClients.map((c) => {
                const accs = accounts.filter((a) => a.ownerId === c.id);
                return (
                  <div key={c.id} className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
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
                      <div key={a.id} className="rounded-lg border border-[var(--glass-border)] bg-[rgba(255,255,255,0.04)] p-3 mb-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-mono text-muted-foreground">{a.accountNumber}</p>
                          <p className="text-xs text-muted-foreground capitalize">{a.type} • {formatCurrency(Number(a.balance))}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <GlassButton variant="secondary" className="text-xs gap-1 px-3 py-2">
                            <ArrowDownRight className="h-3 w-3" /> Deposit
                          </GlassButton>
                          <GlassButton variant="secondary" className="text-xs gap-1 px-3 py-2">
                            <ArrowUpRight className="h-3 w-3" /> Withdraw
                          </GlassButton>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
              {clients.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-4">No clients found</p>}
            </div>
          )}
          {search && (
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              total={clients.length}
              limit={pageSize}
              onPageChange={setCurrentPage}
            />
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default CashierClients;
