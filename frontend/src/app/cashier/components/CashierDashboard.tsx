"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/format";
import { ArrowDownRight, ArrowRightLeft, ArrowUpRight } from "lucide-react";
import { useEffect } from "react";
import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTransactionsThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import GlassTable from "@/components/ui/GlassTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { BentoGrid, BentoItem } from "@/components/ui/BentoGrid";
import { useUiText } from "@/lib/ui-text";
import PaginationBar from "@/components/ui/PaginationBar";

const CashierDashboard = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { t } = useUiText();
  const { transactions } = useAppSelector((state) => state.banking);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    dispatch(fetchTransactionsThunk({ limit: 100 }));
  }, [dispatch]);

  const todayTxns = transactions.filter((txn) => txn.performedBy === user?.id);
  const deposits = todayTxns.filter((txn) => txn.type === "deposit");
  const withdrawals = todayTxns.filter((txn) => txn.type === "withdraw");
  const totalVolume = todayTxns.reduce((sum, txn) => sum + Number(txn.amount), 0);
  const totalPages = Math.ceil(todayTxns.length / pageSize);
  const paginatedTxns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return todayTxns.slice(start, start + pageSize);
  }, [currentPage, todayTxns]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <BentoGrid>
          <BentoItem size="wide">
            <GlassCard className="h-full">
              <h1 className="text-2xl font-bold text-foreground">{t("dashboard.cashier.welcome", "Welcome")}, {user?.firstName}!</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge value="cashier" />
                <span className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </GlassCard>
          </BentoItem>

          <BentoItem size="wide">
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
                    ),
                  },
                  { key: "amount", header: t("dashboard.cashier.amount", "Amount"), render: (row) => formatCurrency(Number(row.amount)) },
                  { key: "status", header: t("dashboard.cashier.status", "Status"), render: (row) => <StatusBadge value={row.status} /> },
                  { key: "createdAt", header: t("dashboard.cashier.date", "Date"), render: (row) => new Date(row.createdAt).toLocaleString() },
                ]}
                data={paginatedTxns.map((row) => ({ ...row, id: String(row.id) }))}
                emptyMessage={t("dashboard.cashier.noOperations", "No operations yet")}
              />
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                total={todayTxns.length}
                limit={pageSize}
                onPageChange={setCurrentPage}
              />
            </GlassCard>
          </BentoItem>
        </BentoGrid>
      </div>
    </DashboardLayout>
  );
};

export default CashierDashboard;
