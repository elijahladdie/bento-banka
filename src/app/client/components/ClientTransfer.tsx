"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/format";
import { useState, useEffect } from "react";
import { ArrowRightLeft } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAccountsThunk, fetchTransactionsThunk, transferFundsThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import GlassSelect from "@/components/ui/GlassSelect";
import { useUiText } from "@/lib/ui-text";

const ClientTransfer = () => {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const { t } = useUiText();
  const dispatch = useAppDispatch();
  const { accounts: allAccounts } = useAppSelector((state) => state.banking);
  const accounts = allAccounts.filter((account) => account.ownerId === user?.id && account.status === "Active");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fromAccount: "",
    toAccount: "",
    amount: "",
    description: ""
  });

  useEffect(() => {
    setMounted(true);
    dispatch(fetchAccountsThunk({}));
  }, [dispatch]);

  if (!mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const amount = Number(form.amount);
    if (!form.fromAccount || !form.toAccount || Number.isNaN(amount) || amount <= 0) {
      setError("Please fill all required fields");
      return;
    }

    const result = await dispatch(
      transferFundsThunk({
        fromAccount: form.fromAccount,
        toAccount: form.toAccount,
        amount,
        description: form.description || "Transfer"
      })
    );

    if (transferFundsThunk.rejected.match(result)) {
      setError(String(result.payload ?? "Transfer failed"));
      return;
    }

    setSuccess(true);
    setForm({ fromAccount: "", toAccount: "", amount: "", description: "" });
    dispatch(fetchAccountsThunk({}));
    dispatch(fetchTransactionsThunk({ limit: 10 }));
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{t("dashboard.client.quickTransfer", "Quick Transfer")}</h1>

        {success ? (
          <GlassCard className="text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="font-bold text-foreground text-lg">{t("dashboard.client.transfer", "Transfer")}</h2>
            <p className="text-sm text-muted-foreground mt-1">Ref: TXN-DEMO-{Date.now().toString(36).toUpperCase()}</p>
          </GlassCard>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">{t("dashboard.client.new", "New")}</h2>
            </div>
            <div className="space-y-2">
              <GlassSelect
                label={t("dashboard.client.selectSource", "Select source account")}
                value={form.fromAccount}
                onChange={(e) => setForm((prev) => ({ ...prev, fromAccount: e.target.value }))}
                options={accounts.map((a) => ({ value: a.id, label: `••••${a.accountNumber.slice(-4)} (${a.type}) — ${formatCurrency(Number(a.balance))}` }))}
                placeholder={t("dashboard.client.selectSource", "Select source account")}
                required
              />
            </div>
            <div className="space-y-2">
              <GlassInput label={t("dashboard.client.destination", "Destination account number")} placeholder="Destination account id" required value={form.toAccount} onChange={(e) => setForm((prev) => ({ ...prev, toAccount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <GlassInput type="number" min="1" label={t("dashboard.client.amount", "Amount")} placeholder="0" required value={form.amount} onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <GlassInput placeholder="Transfer description" maxLength={100} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <div className="rounded-lg bg-secondary/50 p-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Transaction fee</span>
                <span className="text-foreground font-medium">RWF 0</span>
              </div>
            </div>
            <GlassButton className="w-full" type="submit">{t("dashboard.client.transfer", "Transfer")}</GlassButton>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientTransfer;
