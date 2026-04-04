"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatCurrency, getStatusBadgeClass } from "@/lib/format";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAccountsThunk, updateAccountStatusThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import GlassButton from "@/components/ui/GlassButton";
import { useUiText } from "@/lib/ui-text";
import { MoreHorizontal, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useToast } from "@/hooks/useToast";
import GlassSelect from "@/components/ui/GlassSelect";
import PaginationBar from "@/components/ui/PaginationBar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ManagerAccounts = () => {
  const dispatch = useAppDispatch();
  const { accounts, loading } = useAppSelector((state) => state.banking);
  const { t } = useUiText();
  const { showToast } = useToast();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [nextStatus, setNextStatus] = useState<"Active" | "Inactive" | "Dormant">("Active");
  const [statusReason, setStatusReason] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchAccountsThunk({ limit: 200 }));
  }, [dispatch]);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  );

  const selectedOwnerRoleSlug =
    selectedAccount?.owner?.userRoles?.[0]?.role?.slug ??
    t("manager.accounts.ownerRole.unknown", "unknown");

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return accounts;
    }

    return accounts.filter((account) => {
      const fullName = `${account.owner?.firstName ?? ""} ${account.owner?.lastName ?? ""}`.trim().toLowerCase();
      const ownerSlug = String(account.owner?.userRoles?.[0]?.role?.slug ?? "").toLowerCase();
      return (
        String(account.accountNumber).toLowerCase().includes(query) ||
        fullName.includes(query) ||
        String(account.type).toLowerCase().includes(query) ||
        String(account.status).toLowerCase().includes(query) ||
        ownerSlug.includes(query)
      );
    });
  }, [accounts, search]);

  const totalPages = Math.ceil(filteredAccounts.length / pageSize);
  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, currentPage, pageSize]);

  const handleViewAccount = (accountId: string) => {
    setSelectedAccountId(accountId);
    const account = accounts.find((item) => item.id === accountId);
    if (account) {
      setNextStatus(account.status);
    }
    setStatusReason("");
    setDrawerOpen(true);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [accounts.length, search, pageSize]);

  const handleStatusUpdate = async () => {
    if (!selectedAccount) {
      showToast("warning", t("manager.accounts.status.selectAccount", "Please select an account"));
      return;
    }

    try {
      await dispatch(
        updateAccountStatusThunk({
          id: selectedAccount.id,
          status: nextStatus,
          reason: statusReason.trim() || undefined,
        })
      ).unwrap();

      await dispatch(fetchAccountsThunk({ limit: 200 }));
      showToast("success", t("manager.accounts.status.success", "Account status updated successfully"));
    } catch (err) {
      showToast("error", typeof err == "string" ? err : err instanceof Error ? err.message : t("manager.accounts.status.error", "Failed to update account status"));
    }
  };
  const accStatusOpts = ["Active", "Inactive", "Dormant"] as const;
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{t("manager.accounts.title", "Account Management")}</h1>

        <GlassCard>
          <div className="grid grid-cols-4 gap-3 items-center">
            <div className="col-span-3">

              <GlassInput
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("manager.accounts.search", "Search accounts...")}
                icon={<Search className="h-5 w-5 text-muted-foreground" />}
                />
                </div>
                <div className="col-span-1">
                  
              <GlassSelect
                id="manager-accounts-page-size"
                value={String(pageSize)}
                onValueChange={(value) => setPageSize(Number(value))}
                options={[
                  { value: "5", label: "5" },
                  { value: "10", label: "10" },
                  { value: "20", label: "20" },
                  { value: "50", label: "50" },
                ]}
                />
                </div>
            </div>

          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="border-b border-border text-muted-foreground">
                  <TableHead className="text-left py-2 font-medium">{t("manager.accounts.table.account", "Account #")}</TableHead>
                  <TableHead className="text-left py-2 font-medium">{t("manager.accounts.table.client", "Client")}</TableHead>
                  <TableHead className="text-left py-2 font-medium">{t("manager.accounts.table.slug", "Owner Slug")}</TableHead>
                  <TableHead className="text-left py-2 font-medium">{t("manager.accounts.table.type", "Type")}</TableHead>
                  <TableHead className="text-left py-2 font-medium">{t("manager.accounts.table.balance", "Balance")}</TableHead>
                  <TableHead className="text-left py-2 font-medium">{t("manager.accounts.table.status", "Status")}</TableHead>
                  <TableHead className="text-left py-2 font-medium">{t("manager.accounts.table.created", "Created")}</TableHead>
                  <TableHead className="text-left py-2 font-medium">{t("manager.accounts.table.actions", "Actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAccounts.map((a) => (
                  <TableRow key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <TableCell className="py-3 font-mono text-xs">{a.accountNumber}</TableCell>
                    <TableCell className="py-3 text-foreground">{a.owner?.firstName} {a.owner?.lastName}</TableCell>
                    <TableCell className="py-3 capitalize text-muted-foreground">
                      {a.owner?.userRoles?.[0]?.role?.slug ?? t("manager.accounts.ownerRole.unknown", "unknown")}
                    </TableCell>
                    <TableCell className="py-3 capitalize">{a.type}</TableCell>
                    <TableCell className="py-3 font-medium text-primary">{formatCurrency(Number(a.balance))}</TableCell>
                    <TableCell className="py-3"><span className={getStatusBadgeClass(a.status)}>{a.status}</span></TableCell>
                    <TableCell className="py-3 text-muted-foreground text-xs">{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-full p-2 hover:bg-secondary/70 transition-colors"
                            aria-label={t("manager.accounts.table.actions", "Actions")}
                          >
                            <MoreHorizontal className="h-4 w-4 text-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-surface border-border">
                          <DropdownMenuItem onClick={() => handleViewAccount(a.id)}>
                            {t("manager.accounts.actions.view", "View account")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            total={filteredAccounts.length}
            limit={pageSize}
            onPageChange={setCurrentPage}
          />
        </GlassCard>

        <Drawer direction="right" open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="fixed z-50 right-0 left-auto top-0 h-full w-full max-w-xl rounded-none border-r bg-background/95 backdrop-blur-xl">
            <DrawerHeader>
              <DrawerTitle>{t("manager.accounts.drawer.title", "Account Details")}</DrawerTitle>
              <DrawerDescription>
                {selectedAccount
                  ? `${selectedAccount.accountNumber} • ${selectedAccount.owner?.firstName ?? ""} ${selectedAccount.owner?.lastName ?? ""}`
                  : t("manager.accounts.drawer.empty", "No account selected")}
              </DrawerDescription>
            </DrawerHeader>

            {selectedAccount ? (
              <div className="space-y-4 px-4 pb-6 overflow-y-auto">
                <GlassCard>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p className="text-muted-foreground">{t("manager.accounts.table.account", "Account #")}</p>
                    <p className="font-mono text-foreground">{selectedAccount.accountNumber}</p>
                    <p className="text-muted-foreground">{t("manager.accounts.table.client", "Client")}</p>
                    <p className="text-foreground">{selectedAccount.owner?.firstName} {selectedAccount.owner?.lastName}</p>
                    <p className="text-muted-foreground">{t("manager.accounts.table.slug", "Owner Slug")}</p>
                    <p className="capitalize text-foreground">{selectedOwnerRoleSlug}</p>
                    <p className="text-muted-foreground">{t("manager.accounts.table.type", "Type")}</p>
                    <p className="capitalize text-foreground">{selectedAccount.type}</p>
                    <p className="text-muted-foreground">{t("manager.accounts.table.balance", "Balance")}</p>
                    <p className="text-primary font-semibold">{formatCurrency(Number(selectedAccount.balance))}</p>
                    <p className="text-muted-foreground">{t("manager.accounts.table.status", "Status")}</p>
                    <p className="capitalize text-foreground"><span className={`${getStatusBadgeClass(selectedAccount.status)} rounded-full px-4 py-2`}>{selectedAccount.status}</span></p>
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="font-semibold text-foreground mb-3">{t("manager.accounts.status.title", "Change Account Status")}</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="glass-label">{t("manager.accounts.status.next", "New Status")}</label>
                      <GlassSelect
                        options={accStatusOpts.map((status) => ({ value: status, label: status }))}
                        onValueChange={(value) => setNextStatus(value as "Active" | "Inactive" | "Dormant")}
                        placeholder={t("dashboard.client.selectSource", "Select source account")}
                      />
                    </div>
                    <GlassInput
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      label={t("manager.accounts.status.reason", "Reason (optional)")}
                      placeholder={t("manager.accounts.status.reason", "Reason (optional)")}
                    />
                    <GlassButton
                      variant="secondary"
                      className="px-4 py-2"
                      loading={loading.accounts}
                      onClick={handleStatusUpdate}
                    >
                      {t("manager.accounts.status.action", "Update Status")}
                    </GlassButton>
                  </div>
                </GlassCard>
              </div>
            ) : null}
          </DrawerContent>
        </Drawer>
      </div>
    </DashboardLayout>
  );
};

export default ManagerAccounts;
