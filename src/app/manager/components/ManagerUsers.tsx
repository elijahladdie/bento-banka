"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { getStatusBadgeClass } from "@/lib/format";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassInput from "@/components/ui/GlassInput";
import GlassTable from "@/components/ui/GlassTable";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsersThunk } from "@/store/slices/bankingSlice";
import { useUiText } from "@/lib/ui-text";

const ManagerUsers = () => {
  const dispatch = useAppDispatch();
  const { users: allUsers } = useAppSelector((state) => state.banking);
  const { t } = useUiText();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchUsersThunk({ limit: 200 }));
  }, [dispatch]);

  const users = allUsers.filter((u) => {
    const matchSearch = `${u.firstName} ${u.lastName ?? ""} ${u.email}`.toLowerCase().includes(search.toLowerCase());
    const roleSlug = u.userRoles?.[0]?.role?.slug ?? (u as unknown as { roles?: string[] }).roles?.[0];
    const matchRole = roleFilter === "all" || roleSlug === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{t("nav.users", "User Management")}</h1>
        <GlassCard>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <GlassInput placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="glass-input">
              <option value="all">All Roles</option>
              <option value="client">Clients</option>
              <option value="cashier">Cashiers</option>
              <option value="manager">Managers</option>
            </select>
          </div>
          <GlassTable
            columns={[
              {
                key: "user",
                header: "User",
                render: (u) => (
                  <div className="flex items-center gap-2">
                    <img src={u.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-medium text-foreground">{u.firstName} {u.lastName}</span>
                  </div>
                )
              },
              { key: "email", header: "Email" },
              { key: "role", header: "Role", render: (u) => <span className="capitalize">{u.userRoles?.[0]?.role?.name ?? u.userRoles?.[0]?.role?.slug ?? (u as unknown as { roles?: string[] }).roles?.[0]}</span> },
              { key: "status", header: "Status", render: (u) => <span className={getStatusBadgeClass(u.status)}>{u.status.replace("_", " ")}</span> },
              { key: "joined", header: "Joined", render: (u) => new Date(u.createdAt).toLocaleDateString() }
            ]}
            data={users.map((u) => ({ ...u, id: String(u.id), joined: u.createdAt }))}
            emptyMessage="No users found"
          />
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default ManagerUsers;
