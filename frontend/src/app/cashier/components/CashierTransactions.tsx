"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { apiClient, unwrapSuccess } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import { ArrowDownRight, ArrowRightLeft, ArrowUpRight, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { depositFundsThunk, fetchTransactionsThunk, withdrawFundsThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import GlassTable from "@/components/ui/GlassTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { useUiText } from "@/lib/ui-text";
import { useToast } from "@/hooks/useToast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useAuth } from "@/contexts/AuthContext";
import WithdrawForm from "@/components/transactions/WithdrawForm";

type CashierAction = "deposit" | "withdraw";

type AccountLookup = {
  id: string;
  accountNumber: string;
  status: "Active" | "Inactive" | "Dormant";
  type: string;
  balance: number;
  owner?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
};

const CashierTransactions = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { t } = useUiText();
  const { transactions, loading } = useAppSelector((state) => state.banking);

  const [activeForm, setActiveForm] = useState<CashierAction | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [resolvedAccount, setResolvedAccount] = useState<AccountLookup | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchTransactionsThunk({ limit: 100 }));
  }, [dispatch]);

  const todayTxns = transactions.filter((txn) => txn.performedBy === user?.id);

  const resetForm = () => {
    setAccountNumber("");
    setAmount("");
    setDescription("");
    setResolvedAccount(null);
  };

  const openForm = (action: CashierAction) => {
    setActiveForm(action);
    resetForm();
  };

  const closeForm = () => {
    setActiveForm(null);
    resetForm();
  };

  const openWithdrawFlow = () => {
    setActiveForm("withdraw");
    setConfirmOpen(false);
    resetForm();
  };

  const accountNumberValid = /^\d{10,20}$/.test(accountNumber.trim());

  const lookupAccountByNumber = async (): Promise<AccountLookup | null> => {
    if (!accountNumberValid) {
      showToast("warning", t("cashier.accountNumberInvalid", "Account number must be numeric"));
      return null;
    }

    try {
      const response = await apiClient.get(`/accounts/by-number/${accountNumber.trim()}`);
      const account = unwrapSuccess<AccountLookup>(response.data);
      setResolvedAccount(account);

      if (account.status !== "Active") {
        showToast("error", t("cashier.accountNotActive", "Only Active accounts can be operated on"));
      }

      return account;
    } catch {
      setResolvedAccount(null);
      showToast("error", t("cashier.accountNotFound", "Account not found"));
      return null;
    }
  };

  const validateOperation = (action: CashierAction): boolean => {
    if (!resolvedAccount) {
      showToast("warning", t("cashier.verifyAccount", "Please verify the account number first"));
      return false;
    }

    if (resolvedAccount.status !== "Active") {
      showToast("error", t("cashier.accountNotActive", "Only Active accounts can be operated on"));
      return false;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 100) {
      showToast("warning", t("cashier.minAmount", "Minimum amount is 100 RWF"));
      return false;
    }

    if (!description.trim()) {
      showToast("warning", t("cashier.descriptionRequired", "Transaction description is required"));
      return false;
    }

    if (action === "withdraw" && Number(resolvedAccount.balance) < parsedAmount) {
      showToast("error", t("cashier.insufficient", "Insufficient balance for withdrawal"));
      return false;
    }

    return true;
  };

  const openConfirm = async (action: CashierAction) => {
    if (activeForm !== action) return;
    if (!resolvedAccount) {
      const lookedUp = await lookupAccountByNumber();
      if (!lookedUp) return;
    }
    if (!validateOperation(action)) return;
    setConfirmOpen(true);
  };

  const processDeposit = async () => {
    if (!resolvedAccount || !activeForm) return;

    const parsedAmount = Number(amount);

    try {
      const actionResult =
        await dispatch(
          depositFundsThunk({
            toAccount: resolvedAccount.id,
            amount: parsedAmount,
            description: description.trim()
          })
        );

      const isSuccess = depositFundsThunk.fulfilled.match(actionResult);

      if (isSuccess) {
        showToast(
          "success",
          activeForm === "deposit"
            ? t("dashboard.cashier.depositSuccess", "Deposit successful")
            : t("dashboard.cashier.withdrawalSuccess", "Withdrawal successful"),
          `RWF ${formatCurrency(parsedAmount)}`
        );

        await Promise.all([
          dispatch(fetchTransactionsThunk({ limit: 100 })),
          lookupAccountByNumber()
        ]);

        setAmount("");
        setDescription("");
      } else {
        showToast(
          "error",
            t("dashboard.cashier.depositFailed", "Deposit failed")
        );
      }
    } finally {
      setConfirmOpen(false);
    }
  };

  const requestWithdrawal = async () => {
    if (!resolvedAccount || activeForm !== "withdraw") return;

    const parsedAmount = Number(amount);

    try {
      const actionResult = await dispatch(
        withdrawFundsThunk({
          fromAccount: resolvedAccount.id,
          amount: parsedAmount,
          description: description.trim()
        })
      );

      if (withdrawFundsThunk.fulfilled.match(actionResult)) {
        resetForm();
        setActiveForm(null);

        showToast(
          "success",
          t(
            "cashier.withdrawalCodeSent",
            "Withdrawal request submitted. The client must confirm it with the 4-digit code."
          )
        );

        await Promise.all([
          dispatch(fetchTransactionsThunk({ limit: 100 })),
          lookupAccountByNumber()
        ]);
      } else {
        showToast(
          "error",
          t("cashier.withdrawalFailed", "Withdrawal failed")
        );
      }
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{t("nav.transactions", "Transactions")}</h1>

        <GlassCard>
          <h3 className="font-semibold text-foreground mb-3">{t("cashier.transactionActions", "Choose Transaction Type")}</h3>
          <div className="flex flex-wrap gap-2">
            <GlassButton variant="secondary" onClick={() => openForm("deposit")}> 
              <ArrowDownRight className="h-3 w-3" /> {t("dashboard.cashier.deposit", "Deposit")}
            </GlassButton>
            <GlassButton variant="danger" onClick={openWithdrawFlow}> 
              <ArrowUpRight className="h-3 w-3" /> {t("dashboard.cashier.withdraw", "Withdraw")}
            </GlassButton>
          </div>
        </GlassCard>

        <ConfirmModal
          isOpen={activeForm === "deposit"}
          title={t("cashier.depositForm", "Deposit Form")}
          message={
            <div className="space-y-3 text-left">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <GlassInput
                  value={accountNumber}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, "");
                    setAccountNumber(digitsOnly);
                    setResolvedAccount(null);
                  }}
                  onBlur={() => {
                    void lookupAccountByNumber();
                  }}
                  placeholder={t("cashier.accountNumberPlaceholder", "Enter account number")}
                  className="pl-9"
                />
              </div>

              {resolvedAccount ? (
                <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-sm">
                  <p className="text-foreground font-medium">{resolvedAccount.owner?.firstName} {resolvedAccount.owner?.lastName}</p>
                  <p className="text-muted-foreground text-xs">{resolvedAccount.accountNumber} • {resolvedAccount.type}</p>
                  <p className="text-primary text-sm font-semibold mt-1">{formatCurrency(Number(resolvedAccount.balance))}</p>
                  <div className="mt-1"><StatusBadge value={resolvedAccount.status} /></div>
                </div>
              ) : null}

              <GlassInput
                type="number"
                min={100}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t("cashier.amountPlaceholder", "Enter amount")}
              />
              <GlassInput
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("cashier.descriptionPlaceholder", "Reason or source of funds")}
              />
            </div>
          }
          confirmLabel={t("cashier.processDeposit", "Process Deposit")}
          cancelLabel={t("common.cancel", "Cancel")}
          onConfirm={() => {
            void openConfirm("deposit");
          }}
          onCancel={closeForm}
          loading={loading.transactions}
          variant="primary"
        />

        <ConfirmModal
          isOpen={activeForm === "withdraw"}
          title={t("cashier.withdrawForm", "Withdraw Form")}
          message={
            <WithdrawForm
              accountField={
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <GlassInput
                      value={accountNumber}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "");
                        setAccountNumber(digitsOnly);
                        setResolvedAccount(null);
                      }}
                      onBlur={() => {
                        void lookupAccountByNumber();
                      }}
                      placeholder={t("cashier.accountNumberPlaceholder", "Enter account number")}
                      className="pl-9"
                    />
                  </div>

                  {resolvedAccount ? (
                    <div className="rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-sm">
                      <p className="text-foreground font-medium">
                        {resolvedAccount.owner?.firstName} {resolvedAccount.owner?.lastName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {resolvedAccount.accountNumber} • {resolvedAccount.type}
                      </p>
                      <p className="text-primary text-sm font-semibold mt-1">{formatCurrency(Number(resolvedAccount.balance))}</p>
                      <div className="mt-1"><StatusBadge value={resolvedAccount.status} /></div>
                    </div>
                  ) : null}
                </div>
              }
              amount={amount}
              description={description}
              onAmountChange={setAmount}
              onDescriptionChange={setDescription}
              amountLabel={t("dashboard.cashier.amount", "Amount")}
              descriptionLabel={t("dashboard.cashier.description", "Description")}
              amountPlaceholder={t("cashier.amountPlaceholder", "Enter amount")}
              descriptionPlaceholder={t("cashier.descriptionPlaceholder", "Reason or source of funds")}
              hint={t("cashier.withdrawalHint", "The 4-digit code will be sent in-app to the account owner.")}
            />
          }
          confirmLabel={t("cashier.requestWithdrawal", "Request Withdrawal")}
          cancelLabel={t("common.cancel", "Cancel")}
          onConfirm={() => {
            void requestWithdrawal();
          }}
          onCancel={closeForm}
          loading={loading.transactions}
          variant="danger"
        />

        <ConfirmModal
          isOpen={confirmOpen}
          title={activeForm === "deposit" ? t("cashier.confirmDeposit", "Confirm Deposit") : t("cashier.confirmWithdraw", "Confirm Withdrawal")}
          message={`${t("cashier.account", "Account")}: ${resolvedAccount?.accountNumber ?? ""} | ${t("cashier.amount", "Amount")}: ${amount}`}
          confirmLabel={activeForm === "deposit" ? t("cashier.processDeposit", "Process Deposit") : t("cashier.processWithdraw", "Process Withdrawal")}
          cancelLabel={t("common.cancel", "Cancel")}
          onConfirm={processDeposit}
          onCancel={() => setConfirmOpen(false)}
          loading={loading.transactions}
          variant={activeForm === "withdraw" ? "danger" : "primary"}
        />

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
      </div>
    </DashboardLayout>
  );
};

export default CashierTransactions;
