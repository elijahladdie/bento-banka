"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { CheckCircle, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { approveAccountThunk, fetchAccountsThunk, fetchUsersThunk, updateUserStatusThunk, rejectAccountThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import PaginationBar from "@/components/ui/PaginationBar";
import { useToast } from "@/hooks/useToast";
import { useUiText } from "@/lib/ui-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ActionReasonModal from "@/components/ui/ActionReasonModal";

type ApprovalAction = "approve" | "reject";
type ApprovalTarget = "client" | "account";

interface PendingDecision {
  id: string;
  label: string;
  target: ApprovalTarget;
  action: ApprovalAction;
}

const ManagerApprovals = () => {
  const dispatch = useAppDispatch();
  const { users, accounts } = useAppSelector((state) => state.banking);
  const { showToast } = useToast();
  const { t } = useUiText();
  const [clientsPage, setClientsPage] = useState(1);
  const [accountsPage, setAccountsPage] = useState(1);
  const [pendingDecision, setPendingDecision] = useState<PendingDecision | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [decisionLoading, setDecisionLoading] = useState(false);
  const pageSize = 4;

  useEffect(() => {
    dispatch(fetchUsersThunk({ status: "pending_approval", limit: 200 }));
    dispatch(fetchAccountsThunk({ status: "Inactive", limit: 200 }));
  }, [dispatch]);

  const pendingClients = users.filter((user) => user.status === "pending_approval");
  const pendingAccounts = accounts.filter((account) => account.status === "Inactive");
  const paginatedClients = useMemo(() => pendingClients.slice((clientsPage - 1) * pageSize, clientsPage * pageSize), [pendingClients, clientsPage]);
  const paginatedAccounts = useMemo(() => pendingAccounts.slice((accountsPage - 1) * pageSize, accountsPage * pageSize), [pendingAccounts, accountsPage]);
  const totalClientPages = Math.max(Math.ceil(pendingClients.length / pageSize), 1);
  const totalAccountPages = Math.max(Math.ceil(pendingAccounts.length / pageSize), 1);

  const approveClient = async (id: string, name: string, reason: string) => {
    try {
      const result = await dispatch(updateUserStatusThunk({ id, status: "active", reason }));
      if (result.payload) {
        showToast("success", `${name} approved successfully`);
        await dispatch(fetchUsersThunk({ status: "pending_approval", limit: 200 }));
      }
    } catch (error) {
      showToast("error", `Failed to approve ${name}`);
    }
  };

  const rejectClient = async (id: string, name: string, reason: string) => {
    try {
      const result = await dispatch(updateUserStatusThunk({ id, status: "inactive", reason }));
      if (result.payload) {
        showToast("success", `${name} rejected successfully`);
        await dispatch(fetchUsersThunk({ status: "pending_approval", limit: 200 }));
      }
    } catch (error) {
      showToast("error", `Failed to reject ${name}`);
    }
  };

  const approveAccount = async (id: string, accountNumber: string, reason: string) => {
    try {
      const result = await dispatch(approveAccountThunk({ id, reason }));
      if (result.payload) {
        showToast("success", `Account ${accountNumber} approved successfully`);
        await dispatch(fetchAccountsThunk({ status: "Inactive", limit: 200 }));
      }
    } catch (error) {
      showToast("error", `Failed to approve account ${accountNumber}`);
    }
  };

  const rejectAccount = async (id: string, accountNumber: string, reason: string) => {
    try {
      const result = await dispatch(rejectAccountThunk({ id, reason }));
      if (result.payload) {
        showToast("success", `Account ${accountNumber} rejected successfully`);
        await dispatch(fetchAccountsThunk({ status: "Inactive", limit: 200 }));
      }
    } catch (error) {
      showToast("error", `Failed to reject account ${accountNumber}`);
    }
  };

  const openDecisionModal = (decision: PendingDecision) => {
    setPendingDecision(decision);
    setDecisionReason("");
  };

  const closeDecisionModal = () => {
    if (decisionLoading) return;
    setPendingDecision(null);
    setDecisionReason("");
  };

  const submitDecision = async () => {
    if (!pendingDecision) return;
    const reason = decisionReason.trim();
    if (reason.length < 3) {
      showToast("error", "Please provide a clear reason");
      return;
    }

    setDecisionLoading(true);
    try {
      if (pendingDecision.target === "client" && pendingDecision.action === "approve") {
        await approveClient(pendingDecision.id, pendingDecision.label, reason);
      }
      if (pendingDecision.target === "client" && pendingDecision.action === "reject") {
        await rejectClient(pendingDecision.id, pendingDecision.label, reason);
      }
      if (pendingDecision.target === "account" && pendingDecision.action === "approve") {
        await approveAccount(pendingDecision.id, pendingDecision.label, reason);
      }
      if (pendingDecision.target === "account" && pendingDecision.action === "reject") {
        await rejectAccount(pendingDecision.id, pendingDecision.label, reason);
      }
      closeDecisionModal();
    } finally {
      setDecisionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Approvals</h1>

        <GlassCard>
          <Tabs defaultValue="clients" className="w-full space-y-4">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="clients">Pending Clients</TabsTrigger>
              <TabsTrigger value="accounts"
              >Pending Accounts</TabsTrigger>
            </TabsList>

            <TabsContent value="clients" className="space-y-4">
              {pendingClients.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No pending registrations</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="w-full text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>National ID</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedClients.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <img src={client.profilePicture} alt="" className="h-8 w-8 rounded-full object-cover" />
                              <span className="font-medium text-foreground">{client.firstName} {client.lastName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>{client.phoneNumber || "-"}</TableCell>
                          <TableCell>{client.nationalId || "-"}</TableCell>
                          <TableCell>{client.age || "-"}</TableCell>
                          <TableCell>{new Date(client.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <GlassButton
                                variant="secondary"
                                className="flex flex-row items-center gap-1 px-3 py-2 text-emerald-400"
                                onClick={() =>
                                  openDecisionModal({
                                    id: client.id,
                                    label: `${client.firstName} ${client.lastName}`,
                                    target: "client",
                                    action: "approve",
                                  })
                                }
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Approve
                              </GlassButton>
                              <GlassButton
                                variant="danger"
                                className="flex flex-row items-center gap-1 px-3 py-2"
                                onClick={() =>
                                  openDecisionModal({
                                    id: client.id,
                                    label: `${client.firstName} ${client.lastName}`,
                                    target: "client",
                                    action: "reject",
                                  })
                                }
                              >
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </GlassButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <PaginationBar
                currentPage={clientsPage}
                totalPages={totalClientPages}
                total={pendingClients.length}
                limit={pageSize}
                onPageChange={setClientsPage}
              />
            </TabsContent>

            <TabsContent value="accounts" className="space-y-4">
              {pendingAccounts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No pending account requests</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="w-full text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Account #</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedAccounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium text-foreground">
                            {account.owner?.firstName} {account.owner?.lastName}
                          </TableCell>
                          <TableCell className="font-mono text-xs">{account.accountNumber}</TableCell>
                          <TableCell className="capitalize">{account.type}</TableCell>
                          <TableCell>{account.status}</TableCell>
                          <TableCell>{new Date(account.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <GlassButton
                                variant="secondary"
                                className="flex flex-row items-center gap-1 px-3 py-2 text-emerald-400"
                                onClick={() =>
                                  openDecisionModal({
                                    id: account.id,
                                    label: account.accountNumber,
                                    target: "account",
                                    action: "approve",
                                  })
                                }
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Approve
                              </GlassButton>
                              <GlassButton
                                variant="danger"
                                className="flex flex-row items-center gap-1 px-3 py-2"
                                onClick={() =>
                                  openDecisionModal({
                                    id: account.id,
                                    label: account.accountNumber,
                                    target: "account",
                                    action: "reject",
                                  })
                                }
                              >
                                <XCircle className="h-3.5 w-3.5" /> Reject
                              </GlassButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <PaginationBar
                currentPage={accountsPage}
                totalPages={totalAccountPages}
                total={pendingAccounts.length}
                limit={pageSize}
                onPageChange={setAccountsPage}
              />
            </TabsContent>
          </Tabs>
        </GlassCard>

        <ActionReasonModal
          isOpen={!!pendingDecision}
          title={pendingDecision ? `${pendingDecision.action === "approve" ? "Approve" : "Reject"} ${pendingDecision.target}` : "Approval"}
          hint={pendingDecision ? `Add note for ${pendingDecision.label}. This will be sent in notification.` : ""}
          reason={decisionReason}
          onReasonChange={setDecisionReason}
          onCancel={closeDecisionModal}
          onSubmit={submitDecision}
          submitLabel={pendingDecision?.action === "approve" ? "Approve" : "Reject"}
          loading={decisionLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default ManagerApprovals;
