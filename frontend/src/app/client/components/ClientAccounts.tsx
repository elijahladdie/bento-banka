"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, getStatusBadgeClass } from "@/lib/format";
import { CreditCard, Copy, Check } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAccountsThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import CreateAccountForm from "@/components/CreateAccountForm";
import { useUiText } from "@/lib/ui-text";
import PaginationBar from "@/components/ui/PaginationBar";

const ClientAccounts = () => {
  const { user } = useAuth();
  const { t } = useUiText();
  const dispatch = useAppDispatch();
  const { accounts: allAccounts } = useAppSelector((state) => state.banking);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const accounts = allAccounts.filter((account) => account.ownerId === user?.id);

  const totalPages = Math.ceil(accounts.length / pageSize);
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return accounts.slice(start, start + pageSize);
  }, [accounts, currentPage]);

  useEffect(() => {
    setMounted(true);
    dispatch(fetchAccountsThunk({}));
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [user?.id]);

  if (!mounted) return null;

  const copyAccount = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(num);
    setTimeout(() => setCopied(null), 2000);
  };

  const refreshAccounts = async () => {
    await dispatch(fetchAccountsThunk({}));
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.client.myAccounts", "My Accounts")}</h1>
          <CreateAccountForm
            onCreated={refreshAccounts}
            triggerLabel={t("accountForm.actions.open", "Create Bank Account")}
          />
        </div>
        <div className="bento-grid">
          {paginatedAccounts.map((a) => (
            <GlassCard key={a.id}>
              <div className="flex items-center justify-between mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
                <span className={getStatusBadgeClass(a.status)}>{a.status}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm text-muted-foreground font-mono">{a.accountNumber}</p>
                <button onClick={() => copyAccount(a.accountNumber)} className="text-muted-foreground hover:text-primary">
                  {copied === a.accountNumber ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-sm text-muted-foreground capitalize mb-3">{a.type} Account</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(Number(a.balance))}</p>
              <p className="text-xs text-muted-foreground mt-2">Opened {new Date(a.createdAt).toLocaleDateString()}</p>
            </GlassCard>
          ))}
        </div>
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          total={accounts.length}
          limit={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </DashboardLayout>
  );
};

export default ClientAccounts;
