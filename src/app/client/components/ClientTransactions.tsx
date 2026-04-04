"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatCurrency } from "@/lib/format";
import { ArrowDownRight, ArrowRightLeft, ArrowUpRight, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAccountsThunk,
  fetchTransactionsThunk,
  confirmWithdrawalThunk,
  transferFundsThunk,
} from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import GlassTable from "@/components/ui/GlassTable";
import GlassSelect from "@/components/ui/GlassSelect";
import StatusBadge from "@/components/ui/StatusBadge";
import { useUiText } from "@/lib/ui-text";
import { useToast } from "@/hooks/useToast";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import PaginationBar from "@/components/ui/PaginationBar";
import ConfirmWithdrawalForm from "@/components/transactions/ConfirmWithdrawalForm";

type TransactionType = "deposit" | "withdraw" | "transfer";

interface FilterState {
  type: TransactionType | "all";
  status: string;
  dateFrom: string;
  dateTo: string;
}

type DestinationMode = "own" | "other";

const ClientTransactions = () => {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { t } = useUiText();
  const { transactions, accounts, loading } = useAppSelector(
    (state) => state.banking
  );

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    status: "all",
    dateFrom: "",
    dateTo: "",
  });

  // Form & modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [destinationMode, setDestinationMode] = useState<DestinationMode | "">("");
  const [toAccountId, setToAccountId] = useState<string>("");
  const [toAccountSearch, setToAccountSearch] = useState("");
  const [toAccountResults, setToAccountResults] = useState<Array<{
    id: string;
    accountNumber: string;
    type: string;
    owner?: { firstName?: string; lastName?: string } | null;
  }>>([]);
  const [searchingDestination, setSearchingDestination] = useState(false);
  const [fromAccountId, setFromAccountId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
  const [withdrawConfirmationCode, setWithdrawConfirmationCode] = useState("");
  const [pendingWithdrawal, setPendingWithdrawal] = useState<{
    transactionId: string;
    accountId: string;
    accountNumber: string;
    amount: number;
  } | null>(null);

  // Detail drawer state
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(
    null
  );

  useEffect(() => {
    dispatch(fetchAccountsThunk({ limit: 200 }));
    dispatch(fetchTransactionsThunk({ limit: 500 }));
  }, [dispatch]);

  // Get client's accounts
  const clientAccounts = useMemo(
    () => accounts.filter((acc) => acc.owner?.id === user?.id),
    [accounts, user?.id]
  );

  const ownAccountIds = useMemo(
    () => new Set(clientAccounts.map((account) => account.id)),
    [clientAccounts]
  );

  // useEffect(() => {
  //   if (!destinationMode) {
  //     setToAccountResults([]);
  //     setSearchingDestination(false);
  //     return;
  //   }

  //   const query = toAccountSearch.trim();
  //   if (destinationMode === "own") {
  //     const ownMatches = clientAccounts
  //       .filter((account) => account.status === "Active")
  //       .filter((account) => account.id !== fromAccountId)
  //       .filter((account) => {
  //         if (!query) return true;
  //         return account.accountNumber.includes(query);
  //       })
  //       .map((account) => ({
  //         id: account.id,
  //         accountNumber: account.accountNumber,
  //         type: account.type,
  //         owner: account.owner ?? null,
  //       }));

  //     setToAccountResults(ownMatches);
  //     setSearchingDestination(false);
  //     return;
  //   }

  //   if (query.length < 4) {
  //     setToAccountResults([]);
  //     setSearchingDestination(false);
  //     return;
  //   }

  //   const timeout = window.setTimeout(async () => {
  //     setSearchingDestination(true);
  //     try {
  //       const response = await apiClient.get("/accounts", {
  //         params: {
  //           search: query,
  //           status: "Active",
  //           limit: 10,
  //         },
  //       });

  //       const payload = response.data?.data ?? response.data;
  //       const items = (Array.isArray(payload) ? payload : []).filter((account) => {
  //         const accountId = String(account.id ?? "");
  //         return !ownAccountIds.has(accountId) && accountId !== fromAccountId;
  //       });
  //       setToAccountResults(items);
  //     } catch {
  //       setToAccountResults([]);
  //     } finally {
  //       setSearchingDestination(false);
  //     }
  //   }, 300);

  //   return () => window.clearTimeout(timeout);
  // }, [toAccountSearch, destinationMode, clientAccounts, ownAccountIds, fromAccountId]);

useEffect(() => {
  if (!destinationMode) {
    setToAccountResults([]);
    setSearchingDestination(false);
    return;
  }

  const query = toAccountSearch.trim();

  if (query.length < 4) {
    setToAccountResults([]);
    setSearchingDestination(false);
    return;
  }

  const timeout = window.setTimeout(async () => {
    setSearchingDestination(true);

    try {
      const response = await apiClient.get("/accounts", {
        params: {
          search: query,
          status: "Active",
          limit: 10,
        },
      });

      const items = response.data?.data ?? [];

      let filtered: any[] = [];

      if (destinationMode === "own") {
        // ✅ ONLY MY ACCOUNTS
        filtered = items.filter(
          (account) =>
            account.ownerId === user.id && account.id !== fromAccountId
        );
      } else {
        // ✅ OTHER PEOPLE'S ACCOUNTS
        filtered = items.filter(
          (account) =>
            account.ownerId !== user.id && account.id !== fromAccountId
        );
      }

      setToAccountResults(filtered);
    } catch {
      setToAccountResults([]);
    } finally {
      setSearchingDestination(false);
    }
  }, 300);

  return () => window.clearTimeout(timeout);
}, [toAccountSearch, destinationMode, fromAccountId, user.id]);
  useEffect(() => {
    if (toAccountId && toAccountId === fromAccountId) {
      setToAccountId("");
      setToAccountSearch("");
    }
  }, [fromAccountId, toAccountId]);

  const filteredTransactions = useMemo(() => {
    const clientAccountIds = new Set(clientAccounts.map((a) => a.id));

    return transactions.filter((txn) => {
      // Only transactions where user's accounts are involved
      const isUserInvolved =
        clientAccountIds.has(String(txn.fromAccount || "")) ||
        clientAccountIds.has(String(txn.toAccount || ""));
      if (!isUserInvolved) return false;

      // Type filter
      if (filters.type !== "all" && txn.type !== filters.type) return false;

      // Status filter
      if (filters.status !== "all" && txn.status !== filters.status)
        return false;

      // Date range filter
      if (filters.dateFrom) {
        const txnDate = new Date(txn.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (txnDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const txnDate = new Date(txn.createdAt);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (txnDate > toDate) return false;
      }

      return true;
    });
  }, [transactions, filters, clientAccounts]);

  // Paginate
  const totalPages = Math.ceil(filteredTransactions.length / pageSize);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage]);

  // Get selected transaction for detail view
  const selectedTransaction = useMemo(
    () =>
      transactions.find((txn) => txn.id === selectedTransactionId) ?? null,
    [transactions, selectedTransactionId]
  );

  const resetCreateForm = () => {
    setDestinationMode("");
    setToAccountId("");
    setToAccountSearch("");
    setToAccountResults([]);
    setFromAccountId("");
    setAmount("");
    setDescription("");
  };

  const openCreateModal = () => {
    resetCreateForm();
    setCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setCreateModalOpen(false);
    resetCreateForm();
  };

  const selectDestinationAccount = (accountId: string, accountNumber: string) => {
    setToAccountId(accountId);
    setToAccountSearch(accountNumber);
    setToAccountResults([]);
  };

  const validateCreateForm = (): boolean => {
    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0) {
      showToast(
        "warning",
        t("client.transactions.amountRequired", "Amount must be greater than 0")
      );
      return false;
    }

    if (parsedAmount < 100) {
      showToast(
        "warning",
        t(
          "client.transactions.minAmount",
          "Minimum transaction amount is 100 RWF"
        )
      );
      return false;
    }

    if (!description.trim()) {
      showToast(
        "warning",
        t(
          "client.transactions.descriptionRequired",
          "Transaction description is required"
        )
      );
      return false;
    }

    if (!destinationMode) {
      showToast(
        "warning",
        t(
          "client.transactions.destinationTypeRequired",
          "Please choose whether destination account is your own or another user's"
        )
      );
      return false;
    }

    if (!fromAccountId || !toAccountId) {
      showToast(
        "warning",
        t(
          "client.transactions.selectBothAccounts",
          "Please select both source and destination accounts"
        )
      );
      return false;
    }

    if (destinationMode === "own" && !ownAccountIds.has(toAccountId)) {
      showToast(
        "warning",
        t(
          "client.transactions.destinationMustBeOwn",
          "Please select one of your own accounts as destination"
        )
      );
      return false;
    }

    if (destinationMode === "other" && ownAccountIds.has(toAccountId)) {
      showToast(
        "warning",
        t(
          "client.transactions.destinationMustBeOther",
          "Please select another user's account as destination"
        )
      );
      return false;
    }

    if (fromAccountId === toAccountId) {
      showToast(
        "warning",
        t(
          "client.transactions.sameAccount",
          "Source and destination must be different"
        )
      );
      return false;
    }

    const fromAccount = clientAccounts.find((a) => a.id === fromAccountId);
    if (!fromAccount || fromAccount.status !== "Active") {
      showToast(
        "error",
        t(
          "client.transactions.sourceAccountInvalid",
          "Source account must be Active"
        )
      );
      return false;
    }

    if (Number(fromAccount.balance) < parsedAmount) {
      showToast(
        "error",
        t("client.transactions.insufficientBalance", "Insufficient balance")
      );
      return false;
    }

    return true;
  };

  const handleCreateConfirm = async () => {
    if (!validateCreateForm()) return;

    const parsedAmount = Number(amount);

    try {
      await dispatch(
        transferFundsThunk({
          fromAccount: fromAccountId,
          toAccount: toAccountId,
          amount: parsedAmount,
          description: description.trim(),
        })
      ).unwrap();

      showToast(
        "success",
        t("client.transactions.transferSuccess", "Transfer successful"),
        `RWF ${formatCurrency(parsedAmount)}`
      );

      // Refresh transactions
      await dispatch(fetchTransactionsThunk({ limit: 500 }));

      closeCreateModal();
      setCurrentPage(1);
    } catch (err) {
      showToast(
        "error",
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : t("client.transactions.operationFailed", "Operation failed")
      );
    } finally {
      setConfirmOpen(false);
    }
  };

  const openDetailDrawer = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    setDetailDrawerOpen(true);
  };

  const openWithdrawConfirm = (transactionId: string) => {
    const txn = filteredTransactions.find((item) => String(item.id) === String(transactionId));
    if (!txn || txn.type !== "withdraw" || txn.status !== "pending") {
      showToast("warning", t("client.transactions.noPendingWithdrawal", "No pending withdrawal selected"));
      return;
    }

    const fromAccountId = String(txn.fromAccount ?? "");
    const source = accounts.find((a) => a.id === fromAccountId);

    setPendingWithdrawal({
      transactionId: String(txn.id),
      accountId: fromAccountId,
      accountNumber: source?.accountNumber ?? "-",
      amount: Number(txn.amount),
    });
    setWithdrawConfirmationCode("");
    setWithdrawConfirmOpen(true);
  };

  const confirmWithdrawal = async () => {
    if (!pendingWithdrawal || withdrawConfirmationCode.length !== 4) {
      return;
    }

    try {
      const actionResult = await dispatch(
        confirmWithdrawalThunk({
          transactionId: pendingWithdrawal.transactionId,
          confirmationCode: withdrawConfirmationCode,
        })
      );

      if (confirmWithdrawalThunk.fulfilled.match(actionResult)) {
        showToast(
          "success",
          t("client.transactions.withdrawalSuccess", "Withdrawal processed successfully")
        );
        await Promise.all([
          dispatch(fetchTransactionsThunk({ limit: 500 })),
          dispatch(fetchAccountsThunk({ limit: 200 })),
        ]);
        setWithdrawConfirmOpen(false);
        setWithdrawConfirmationCode("");
        setPendingWithdrawal(null);
      } else {
        showToast("error", t("client.transactions.withdrawalConfirmationFailed", "Unable to confirm withdrawal"));
      }
    } catch (error) {
      showToast(
        "error",
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : t("client.transactions.withdrawalConfirmationFailed", "Unable to confirm withdrawal")
      );
    }
  };

  const transactionTypeOptions = [
    { value: "all", label: t("filters.allTypes", "All Types") },
    { value: "withdraw", label: t("dashboard.cashier.withdraw", "Withdraw") },
    { value: "transfer", label: t("dashboard.client.transfer", "Transfer") },
  ];

  const statusOptions = [
    { value: "all", label: t("filters.allStatus", "All Status") },
    { value: "pending", label: t("transaction.status.pending", "Pending") },
    { value: "completed", label: t("transaction.status.completed", "Completed") },
    { value: "failed", label: t("transaction.status.failed", "Failed") },
  ];

  const shouldShowDestinationResults =
    destinationMode === "own"
      ? Boolean(destinationMode)
      : destinationMode === "other" && toAccountSearch.trim().length >= 4;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            {t("nav.transactions", "Transactions")}
          </h1>
          <GlassButton
            onClick={openCreateModal}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t("client.transactions.new", "Transact")}
          </GlassButton>
        </div>

        <ConfirmModal
          isOpen={withdrawConfirmOpen}
          title={t("client.transactions.confirmWithdrawal", "Confirm Withdrawal")}
          message={
            <ConfirmWithdrawalForm
              confirmationCode={withdrawConfirmationCode}
              onConfirmationCodeChange={setWithdrawConfirmationCode}
              label={t("client.transactions.confirmationCode", "4-digit code")}
              placeholder={t("client.transactions.confirmationPlaceholder", "1234")}
              hint={
                pendingWithdrawal
                  ? `${t("client.transactions.account", "Account")}: ${pendingWithdrawal.accountNumber} | ${t("dashboard.client.amount", "Amount")}: ${formatCurrency(pendingWithdrawal.amount)}`
                  : undefined
              }
            />
          }
          confirmLabel={t("client.transactions.confirm", "Confirm Withdrawal")}
          cancelLabel={t("common.cancel", "Cancel")}
          onConfirm={() => {
            void confirmWithdrawal();
          }}
          onCancel={() => {
            setWithdrawConfirmOpen(false);
            setWithdrawConfirmationCode("");
            setPendingWithdrawal(null);
          }}
          loading={loading.transactions}
          variant="danger"
        />

        {/* Filters */}
        <GlassCard>
          <h3 className="font-semibold text-foreground mb-3">
            {t("filters.title", "Filters")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <GlassSelect
              options={transactionTypeOptions}
              onValueChange={(value) =>
                setFilters({ ...filters, type: value as FilterState["type"] })
              }
              placeholder={t("filters.type", "Filter by type")}
            />
            <GlassSelect
              options={statusOptions}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value })
              }
              placeholder={t("filters.status", "Filter by status")}
            />
            <GlassInput
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              placeholder={t("filters.dateFrom", "From date")}
            />
            <GlassInput
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
              placeholder={t("filters.dateTo", "To date")}
            />
          </div>
          {(filters.type !== "all" ||
            filters.status !== "all" ||
            filters.dateFrom ||
            filters.dateTo) && (
            <GlassButton
              variant="secondary"
              className="mt-3"
              onClick={() =>
                setFilters({
                  type: "all",
                  status: "all",
                  dateFrom: "",
                  dateTo: "",
                })
              }
            >
              {t("filters.clear", "Clear filters")}
            </GlassButton>
          )}
        </GlassCard>

        {/* Transactions Table */}
        <GlassCard>
          <GlassTable
            columns={[
              {
                key: "type",
                header: t("dashboard.cashier.type", "Type"),
                render: (row) => (
                  <div className="flex items-center gap-1">
                    {row.type === "withdraw" && (
                      <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />
                    )}
                    {row.type === "transfer" && (
                      <ArrowRightLeft className="h-3.5 w-3.5 text-blue-400" />
                    )}
                    {row.type === "deposit" && (
                      <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />
                    )}
                    <span className="capitalize">{row.type}</span>
                  </div>
                ),
              },
              {
                key: "account",
                header: t("client.transactions.account", "Account"),
                render: (row) => {
                  const accountId =
                    row.type === "withdraw" || row.type === "transfer"
                      ? row.fromAccount
                      : row.toAccount;
                  const account = accounts.find((a) => a.id === String(accountId));
                  return account?.accountNumber ?? "-";
                },
              },
              {
                key: "amount",
                header: t("dashboard.cashier.amount", "Amount"),
                render: (row) => formatCurrency(Number(row.amount)),
              },
               {
                key: "balanceAfter",
                header: t("dashboard.cashier.balanceAfter", "Balance After"),
                render: (row) => formatCurrency(Number(row.balanceAfter)),
              },
              {
                key: "status",
                header: t("dashboard.cashier.status", "Status"),
                render: (row) => <StatusBadge value={row.status} />,
              },
              {
                key: "createdAt",
                header: t("dashboard.cashier.date", "Date"),
                render: (row) =>
                  new Date(row.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
              },
              {
                key: "actions",
                header: t("common.actions", "Actions"),
                render: (row) => (
                  <div className="flex items-center gap-2">
                    {row.type === "withdraw" && row.status === "pending" ? (
                      <GlassButton
                        variant="danger"
                        onClick={() => openWithdrawConfirm(String(row.id))}
                      >
                        {t("client.transactions.confirmWithdrawal", "Confirm Withdrawal")}
                      </GlassButton>
                    ) : null}
                    <GlassButton
                      variant="secondary"
                      onClick={() => openDetailDrawer(row.id)}
                    >
                      {t("client.transactions.view", "View")}
                    </GlassButton>
                  </div>
                ),
              },
            ]}
            data={paginatedTransactions.map((row) => ({
              ...row,
              id: String(row.id),
            }))}
            emptyMessage={t(
              "client.transactions.noTransactions",
              "No transactions found"
            )}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                total={filteredTransactions.length}
                limit={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </GlassCard>

        {/* Create Transaction Modal */}
        <ConfirmModal
          isOpen={createModalOpen}
          title={t("client.transactions.new", "Transact")}
          message={
            <div className="space-y-3 text-left">
              <div>
                <label className="glass-label block mb-1">
                  {t("dashboard.client.selectSource", "Source Account")}
                </label>
                <GlassSelect
                  options={clientAccounts.map((acc) => ({
                    value: acc.id,
                    label: `${acc.accountNumber} • ${acc.type} (${formatCurrency(Number(acc.balance))})`,
                  }))}
                  onValueChange={setFromAccountId}
                  placeholder={t(
                    "client.transactions.selectSourcePlaceholder",
                    "Select source account"
                  )}
                />
              </div>
              <div>
                <label className="glass-label block mb-1">
                  {t("client.transactions.destinationType", "Destination Type")}
                </label>
                <GlassSelect
                  options={[
                    {
                      value: "own",
                      label: t("client.transactions.destinationOwn", "My own account"),
                    },
                    {
                      value: "other",
                      label: t("client.transactions.destinationOther", "Another user's account"),
                    },
                  ]}
                  onValueChange={(value) => {
                    setDestinationMode(value as DestinationMode);
                    setToAccountId("");
                    setToAccountSearch("");
                    setToAccountResults([]);
                  }}
                  placeholder={t(
                    "client.transactions.destinationTypePlaceholder",
                    "Choose destination type"
                  )}
                />
              </div>
              <div>
                <label className="glass-label block mb-1">
                  {t("dashboard.client.selectDestination", "Destination Account")}
                </label>
                <GlassInput
                  value={toAccountSearch}
                  onChange={(e) => {
                    setToAccountSearch(e.target.value);
                    setToAccountId("");
                  }}
                  placeholder={t(
                    destinationMode === "own"
                      ? "client.transactions.selectOwnDestinationPlaceholder"
                      : "client.transactions.selectDestinationPlaceholder",
                    destinationMode === "own"
                      ? "Search your account number"
                      : "Type account number to search"
                  )}
                  inputMode="numeric"
                  autoComplete="off"
                  disabled={!destinationMode}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {t(
                    destinationMode === "own"
                      ? "client.transactions.destinationOwnHint"
                      : "client.transactions.destinationHint",
                    destinationMode === "own"
                      ? "Search and select one of your own active accounts"
                      : "Search by account number and select a result"
                  )}
                </p>
                {shouldShowDestinationResults ? (
                  <div className="mt-2 max-h-56 overflow-y-auto rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2">
                    {searchingDestination ? (
                      <p className="px-3 py-4 text-sm text-muted-foreground">
                        {t("common.loading", "Loading...")}
                      </p>
                    ) : toAccountResults.length > 0 ? (
                      <div className="space-y-2">
                        {toAccountResults.map((account) => (
                          <button
                            key={account.id}
                            type="button"
                            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left transition hover:bg-white/10"
                            onClick={() => selectDestinationAccount(account.id, account.accountNumber)}
                          >
                            <div>
                              <p className="font-mono text-sm text-foreground">{account.accountNumber}</p>
                              <p className="text-xs text-muted-foreground">
                                {account.type}
                                {account.owner?.firstName || account.owner?.lastName
                                  ? ` • ${account.owner?.firstName ?? ""} ${account.owner?.lastName ?? ""}`.trim()
                                  : ""}
                              </p>
                            </div>
                            <span className="rounded-full border border-primary/30 px-2 py-1 text-xs text-primary">
                              {t("common.select", "Select")}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="px-3 py-4 text-sm text-muted-foreground">
                        {t("client.transactions.noResults", "No matching accounts found")}
                      </p>
                    )}
                  </div>
                ) : null}
                {toAccountId ? (
                  <div className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                    {t("client.transactions.selectedDestination", "Selected destination")}: <span className="font-mono">{toAccountSearch}</span>
                  </div>
                ) : null}
              </div>

              <GlassInput
                type="number"
                min={100}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={t("cashier.amountPlaceholder", "Enter amount")}
                label={t("client.transactions.amount", "Amount")}
              />
              <GlassInput
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t(
                  "client.transactions.descriptionPlaceholder",
                  "Enter transaction description"
                )}
                label={t(
                  "client.transactions.description",
                  "Description"
                )}
              />
            </div>
          }
          confirmLabel={t("client.transactions.continue", "Continue")}
          cancelLabel={t("common.cancel", "Cancel")}
          onConfirm={() => {
            if (validateCreateForm()) {
              setConfirmOpen(true);
            }
          }}
          onCancel={closeCreateModal}
          loading={loading.transactions}
        />

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={confirmOpen}
          title={t("client.transactions.confirmTransaction", "Confirm Transaction")}
          message={`${t("client.transactions.amount", "Amount")}: RWF ${formatCurrency(Number(amount))} | ${t("client.transactions.description", "Description")}: ${description}`}
          confirmLabel={t("client.transactions.confirm", "Confirm")}
          cancelLabel={t("common.cancel", "Cancel")}
          onConfirm={handleCreateConfirm}
          onCancel={() => setConfirmOpen(false)}
          loading={loading.transactions}
        />

        {/* Detail Drawer */}
        <Drawer
          direction="right"
          open={detailDrawerOpen}
          onOpenChange={setDetailDrawerOpen}
        >
          <DrawerContent className="fixed z-50 right-0 left-auto top-0 h-full w-full max-w-xl rounded-none border-r bg-background/95 backdrop-blur-xl">
            <DrawerHeader>
              <DrawerTitle>
                {t("client.transactions.details", "Transaction Details")}
              </DrawerTitle>
              <DrawerDescription>
                {selectedTransaction
                  ? new Date(selectedTransaction.createdAt).toLocaleDateString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )
                  : t(
                      "client.transactions.noTransaction",
                      "No transaction selected"
                    )}
              </DrawerDescription>
            </DrawerHeader>

            {selectedTransaction ? (
              <div className="space-y-4 px-4 pb-6 overflow-y-auto">
                <GlassCard>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p className="text-muted-foreground">
                      {t("dashboard.cashier.type", "Type")}
                    </p>
                    <p className="flex items-center gap-1 font-medium">
                      {selectedTransaction.type === "withdraw" && (
                        <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />
                      )}
                      {selectedTransaction.type === "transfer" && (
                        <ArrowRightLeft className="h-3.5 w-3.5 text-blue-400" />
                      )}
                      {selectedTransaction.type === "deposit" && (
                        <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />
                      )}
                      <span className="capitalize">
                        {selectedTransaction.type}
                      </span>
                    </p>

                    <p className="text-muted-foreground">
                      {t("dashboard.cashier.amount", "Amount")}
                    </p>
                    <p className="font-semibold text-primary">
                      RWF {formatCurrency(Number(selectedTransaction.amount))}
                    </p>

                    <p className="text-muted-foreground">
                      {t("dashboard.cashier.status", "Status")}
                    </p>
                    <StatusBadge value={selectedTransaction.status} />

                    {selectedTransaction.type !== "deposit" && (
                      <>
                        <p className="text-muted-foreground">
                          {t(
                            "client.transactions.fromAccount",
                            "From Account"
                          )}
                        </p>
                        <p className="font-mono">
                          {accounts.find(
                            (a) => a.id === String(selectedTransaction.fromAccount)
                          )?.accountNumber ?? "-"}
                        </p>
                      </>
                    )}

                    {(selectedTransaction.type === "transfer" ||
                      selectedTransaction.type === "deposit") && (
                      <>
                        <p className="text-muted-foreground">
                          {t("client.transactions.toAccount", "To Account")}
                        </p>
                        <p className="font-mono">
                          {accounts.find(
                            (a) => a.id === String(selectedTransaction.toAccount)
                          )?.accountNumber ?? "-"}
                        </p>
                      </>
                    )}

                    <p className="text-muted-foreground">
                      {t("client.transactions.description", "Description")}
                    </p>
                    <p>{selectedTransaction.description || "-"}</p>

                    <p className="text-muted-foreground">
                      {t("dashboard.cashier.reference", "Reference")}
                    </p>
                    <p className="font-mono text-xs">
                      {selectedTransaction.reference || "-"}
                    </p>

                    <p className="text-muted-foreground">
                      {t("client.transactions.date", "Date/Time")}
                    </p>
                    <p className="text-xs">
                      {new Date(selectedTransaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </GlassCard>

                {selectedTransaction.balanceBefore !== undefined &&
                  selectedTransaction.balanceAfter !== undefined && (
                    <GlassCard>
                      <h3 className="font-semibold text-foreground mb-2">
                        {t("client.transactions.balanceInfo", "Balance Info")}
                      </h3>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="text-muted-foreground">
                            Balance Before:{" "}
                          </span>
                          RWF {formatCurrency(Number(selectedTransaction.balanceBefore))}
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Balance After:{" "}
                          </span>
                          RWF {formatCurrency(Number(selectedTransaction.balanceAfter))}
                        </p>
                      </div>
                    </GlassCard>
                  )}
              </div>
            ) : null}
          </DrawerContent>
        </Drawer>
      </div>
    </DashboardLayout>
  );
};

export default ClientTransactions;
