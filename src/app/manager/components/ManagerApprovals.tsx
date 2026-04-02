"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { getStatusBadgeClass } from "@/lib/format";
import { CheckCircle, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { approveAccountThunk, fetchAccountsThunk, fetchUsersThunk, updateUserStatusThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";

const ManagerApprovals = () => {
  const dispatch = useAppDispatch();
  const { users, accounts } = useAppSelector((state) => state.banking);

  useEffect(() => {
    dispatch(fetchUsersThunk({ status: "pending_approval", limit: 200 }));
    dispatch(fetchAccountsThunk({ status: "Inactive", limit: 200 }));
  }, [dispatch]);

  const pendingClients = users.filter((user) => user.status === "pending_approval");
  const pendingAccounts = accounts.filter((account) => account.status === "Inactive");

  const approveClient = async (id: string) => {
    await dispatch(updateUserStatusThunk({ id, status: "active" }));
    dispatch(fetchUsersThunk({ status: "pending_approval", limit: 200 }));
  };

  const rejectClient = async (id: string) => {
    await dispatch(updateUserStatusThunk({ id, status: "inactive" }));
    dispatch(fetchUsersThunk({ status: "pending_approval", limit: 200 }));
  };

  const approveAccount = async (id: string) => {
    await dispatch(approveAccountThunk(id));
    dispatch(fetchAccountsThunk({ status: "Inactive", limit: 200 }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Approvals</h1>

        <GlassCard>
          <h3 className="font-semibold text-foreground mb-4">Pending Client Registrations</h3>
          {pendingClients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No pending registrations</p>
          ) : (
            <div className="bento-grid">
              {pendingClients.map((c) => (
                <div key={c.id} className="rounded-xl border border-border bg-secondary/50 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={c.profilePicture} alt="" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-foreground">{c.firstName} {c.lastName}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <p>Phone: {c.phoneNumber}</p>
                    <p>National ID: {c.nationalId}</p>
                    <p>Age: {c.age}</p>
                    <p>Registered: {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <GlassButton variant="secondary" className="flex-1 gap-1 text-emerald-400" onClick={() => approveClient(c.id)}>
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </GlassButton>
                    <GlassButton variant="danger" className="flex-1 gap-1" onClick={() => rejectClient(c.id)}>
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </GlassButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold text-foreground mb-4">Pending Account Requests</h3>
          {pendingAccounts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No pending account requests</p>
          ) : (
            <div className="bento-grid">
              {pendingAccounts.map((a) => (
                <div key={a.id} className="rounded-xl border border-border bg-secondary/50 p-4">
                  <p className="font-medium text-foreground">{a.owner?.firstName} {a.owner?.lastName}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">{a.type} Account • {a.accountNumber}</p>
                  <p className="text-xs text-muted-foreground">Requested: {new Date(a.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-2 mt-3">
                    <GlassButton variant="secondary" className="flex-1 gap-1 px-3 py-2 text-emerald-400" onClick={() => approveAccount(a.id)}>
                      <CheckCircle className="h-3.5 w-3.5" /> Approve
                    </GlassButton>
                    <GlassButton variant="danger" className="flex-1 gap-1 px-3 py-2">
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </GlassButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default ManagerApprovals;
