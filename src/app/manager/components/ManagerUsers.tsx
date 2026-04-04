"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { getStatusBadgeClass } from "@/lib/format";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import GlassTable from "@/components/ui/GlassTable";
import PaginationBar from "@/components/ui/PaginationBar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createUserThunk, fetchUsersThunk, updateUserStatusThunk } from "@/store/slices/bankingSlice";
import { useUiText } from "@/lib/ui-text";
import { useToast } from "@/hooks/useToast";
import GlassSelect from "@/components/ui/GlassSelect";
import { uploadImageToCloudinary, validateProfileImage } from "@/lib/cloudinary";
import { MoreHorizontal } from "lucide-react";
import type { UserStatus } from "@/types";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ManagerUsers = () => {
  const dispatch = useAppDispatch();
  const { users: allUsers, loading } = useAppSelector((state) => state.banking);
  const { t } = useUiText();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserStatus, setSelectedUserStatus] = useState<UserStatus>("active");
  const [statusReason, setStatusReason] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    nationalId: "",
    password: "",
    age: "",
    roleSlug: "client" as "client" | "cashier" | "manager",
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void dispatch(
        fetchUsersThunk({
          limit: 200,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(roleFilter !== "all" ? { role: roleFilter } : {}),
        })
      );
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [dispatch, search, roleFilter]);

  const users = allUsers;
  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId]
  );

  const statusOptions = [
    { value: "active", label: t("manager.users.status.active", "Active") },
    { value: "inactive", label: t("manager.users.status.inactive", "Inactive") },
    { value: "suspended", label: t("manager.users.status.suspended", "Suspended") },
    { value: "pending_approval", label: t("manager.users.status.pendingApproval", "Pending Approval") },
  ];

  const totalPages = Math.ceil(users.length / pageSize);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [currentPage, users, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, pageSize]);

  const onCreateInputChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      return;
    }

    const validationMessage = validateProfileImage(file);
    if (validationMessage) {
      showToast({ type: "error", message: validationMessage });
      event.target.value = "";
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      return;
    }

    setProfilePictureFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const resetCreateForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      nationalId: "",
      password: "",
      age: "",
      roleSlug: "client",
    });
    setProfilePictureFile(null);
    setProfilePicturePreview(null);
  };

  const openCreateDrawer = () => {
    resetCreateForm();
    setCreateDrawerOpen(true);
  };

  const closeCreateDrawer = () => {
    setCreateDrawerOpen(false);
    resetCreateForm();
  };

  const openUserDetailsDrawer = (userId: string) => {
    const user = users.find((item) => item.id === userId);
    if (!user) {
      return;
    }

    setSelectedUserId(userId);
    setSelectedUserStatus(user.status);
    setStatusReason("");
    setDetailsDrawerOpen(true);
  };

  const closeUserDetailsDrawer = () => {
    setDetailsDrawerOpen(false);
    setSelectedUserId(null);
    setStatusReason("");
  };

  const handleUserStatusUpdate = async () => {
    if (!selectedUser) {
      showToast({
        type: "warning",
        message: t("manager.users.drawer.noSelection", "Please select a user"),
      });
      return;
    }

    try {
      setSubmitting(true);
      await dispatch(
        updateUserStatusThunk({
          id: selectedUser.id,
          status: selectedUserStatus,
          reason: statusReason.trim() || undefined,
        })
      ).unwrap();

      await dispatch(
        fetchUsersThunk({
          limit: 200,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(roleFilter !== "all" ? { role: roleFilter } : {}),
        })
      );

      showToast({
        type: "success",
        message: t("manager.users.drawer.statusSuccess", "User status updated successfully"),
      });
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : t("manager.users.drawer.statusError", "Failed to update user status"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName || !form.email || !form.nationalId || !form.password || !form.age) {
      showToast({
        type: "error",
        message: t("manager.users.create.validation.required", "Please fill all required fields")
      });
      return;
    }

    const age = Number(form.age);
    if (!Number.isFinite(age) || age < 18) {
      showToast({
        type: "error",
        message: t("manager.users.create.validation.age", "Age must be at least 18")
      });
      return;
    }

    try {
      setSubmitting(true);
      let profilePictureUrl: string | undefined;

      if (profilePictureFile) {
        profilePictureUrl = await uploadImageToCloudinary(profilePictureFile);
      }

      await dispatch(
        createUserThunk({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim() || undefined,
          email: form.email.trim(),
          phoneNumber: form.phoneNumber.trim() || undefined,
          nationalId: form.nationalId.trim(),
          password: form.password,
          age,
          roleSlug: form.roleSlug,
          profilePicture: profilePictureUrl
        })
      ).unwrap();

      await dispatch(
        fetchUsersThunk({
          limit: 200,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(roleFilter !== "all" ? { role: roleFilter } : {}),
        })
      );

      closeCreateDrawer();
      showToast({
        type: "success",
        message: t("manager.users.create.success", "User account created successfully")
      });
    } catch (err) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : t("manager.users.create.error", "Failed to create user account")
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t("nav.users", "User Management")}</h1>
          <GlassButton type="button" variant="primary" className="self-start sm:self-auto" onClick={openCreateDrawer}>
            {t("manager.users.create.open", "Create User")}
          </GlassButton>
        </div>

        <Drawer direction="right" open={createDrawerOpen} onOpenChange={(open) => (open ? setCreateDrawerOpen(true) : closeCreateDrawer())}>
          <DrawerContent className="fixed z-50 right-0 left-auto top-0 h-full w-full max-w-xl rounded-none border-l bg-background/95 backdrop-blur-xl">
            <DrawerHeader className="text-left">
              <DrawerTitle>{t("manager.users.create.drawerTitle", "Create User Account")}</DrawerTitle>
              <DrawerDescription>{t("manager.users.create.drawerDescription", "Add a new user and assign a platform role.")}</DrawerDescription>
            </DrawerHeader>

            <form onSubmit={handleCreateUser} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <GlassInput
                  label={t("manager.users.create.firstName", "First Name")}
                  value={form.firstName}
                  onChange={(e) => onCreateInputChange("firstName", e.target.value)}
                  placeholder={t("manager.users.create.firstName", "First Name")}
                  required
                />
                <GlassInput
                  label={t("manager.users.create.lastName", "Last Name")}
                  value={form.lastName}
                  onChange={(e) => onCreateInputChange("lastName", e.target.value)}
                  placeholder={t("manager.users.create.lastName", "Last Name")}
                />
                <GlassInput
                  type="email"
                  label={t("manager.users.create.email", "Email")}
                  value={form.email}
                  onChange={(e) => onCreateInputChange("email", e.target.value)}
                  placeholder={t("manager.users.create.email", "Email")}
                  required
                />
                <GlassInput
                  label={t("manager.users.create.phone", "Phone Number")}
                  value={form.phoneNumber}
                  onChange={(e) => onCreateInputChange("phoneNumber", e.target.value)}
                  placeholder={t("manager.users.create.phone", "Phone Number")}
                />
                <GlassInput
                  label={t("manager.users.create.nationalId", "National ID")}
                  value={form.nationalId}
                  onChange={(e) => onCreateInputChange("nationalId", e.target.value)}
                  placeholder={t("manager.users.create.nationalId", "National ID")}
                  required
                />
                <GlassInput
                  type="number"
                  min={18}
                  label={t("manager.users.create.age", "Age")}
                  value={form.age}
                  onChange={(e) => onCreateInputChange("age", e.target.value)}
                  placeholder={t("manager.users.create.age", "Age")}
                  required
                />
                <GlassInput
                  type="password"
                  label={t("manager.users.create.password", "Password")}
                  value={form.password}
                  onChange={(e) => onCreateInputChange("password", e.target.value)}
                  placeholder={t("manager.users.create.password", "Password")}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="glass-label">{t("manager.users.create.profilePictureUpload", "Upload Profile Picture")}</label>
                <input
                  type="file"
                  accept="image/*"
                  className="glass-input !px-4 !py-3 file:mr-3 file:rounded-full file:border-0 file:bg-primary/20 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary"
                  onChange={handleProfilePictureChange}
                />
                <p className="text-xs text-muted-foreground">
                  {t("manager.users.create.profilePictureHint", "Image only, max 2MB")}
                </p>
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt={t("manager.users.create.profilePicturePreviewAlt", "Profile picture preview")}
                    className="h-20 w-20 rounded-full border border-[var(--glass-border)] object-cover"
                  />
                ) : null}
              </div>

              <div className="space-y-1">
                <label className="glass-label">{t("manager.users.create.role", "Role")}</label>
                <GlassSelect
                  id="manager-user-role"
                  options={[
                    { value: "client", label: t("manager.users.create.roles.client", "Client") },
                    { value: "cashier", label: t("manager.users.create.roles.cashier", "Cashier") },
                    { value: "manager", label: t("manager.users.create.roles.manager", "Manager") },
                  ]}
                  onValueChange={(value) => onCreateInputChange("roleSlug", value as "client" | "cashier" | "manager")}
                  placeholder={t("manager.users.create.rolePlaceholder", "Select role")}
                  value={form.roleSlug}
                />
              </div>

              <DrawerFooter className="px-0 pt-2">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <GlassButton type="button" variant="secondary" onClick={closeCreateDrawer}>
                    {t("common.cancel", "Cancel")}
                  </GlassButton>
                  <GlassButton type="submit" variant="primary" loading={loading.users || submitting} loadingText={t("common.loading", "Loading...") }>
                    {t("manager.users.create.submit", "Create Account")}
                  </GlassButton>
                </div>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>

        <Drawer direction="right" open={detailsDrawerOpen} onOpenChange={(open) => (open ? setDetailsDrawerOpen(true) : closeUserDetailsDrawer())}>
          <DrawerContent className="fixed z-50 right-0 left-auto top-0 h-full w-full max-w-xl rounded-none border-l bg-background/95 backdrop-blur-xl">
            <DrawerHeader className="text-left">
              <DrawerTitle>{t("manager.users.drawer.title", "User Details")}</DrawerTitle>
              <DrawerDescription>
                {selectedUser
                  ? `${selectedUser.firstName} ${selectedUser.lastName ?? ""} • ${selectedUser.email}`
                  : t("manager.users.drawer.empty", "No user selected")}
              </DrawerDescription>
            </DrawerHeader>

            {selectedUser ? (
              <div className="space-y-4 px-4 pb-6 overflow-y-auto">
                <GlassCard>
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedUser.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.id}`}
                      alt={t("manager.users.table.avatarAlt", "User avatar")}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-foreground">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                      <p className="text-sm text-muted-foreground">{selectedUser.phoneNumber || t("manager.users.drawer.noPhone", "No phone number")}</p>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p className="text-muted-foreground">{t("manager.users.drawer.id", "User ID")}</p>
                    <p className="font-mono text-foreground break-all">{selectedUser.id}</p>
                    <p className="text-muted-foreground">{t("manager.users.drawer.nationalId", "National ID")}</p>
                    <p className="text-foreground">{selectedUser.nationalId || "-"}</p>
                    <p className="text-muted-foreground">{t("manager.users.drawer.age", "Age")}</p>
                    <p className="text-foreground">{selectedUser.age ?? "-"}</p>
                    <p className="text-muted-foreground">{t("manager.users.drawer.role", "Role")}</p>
                    <p className="capitalize text-foreground">{selectedUser.userRoles?.[0]?.role?.slug ?? "-"}</p>
                    <p className="text-muted-foreground">{t("manager.users.drawer.status", "Status")}</p>
                    <p className="text-foreground capitalize">{selectedUser.status.replace("_", " ")}</p>
                    <p className="text-muted-foreground">{t("manager.users.drawer.joined", "Joined")}</p>
                    <p className="text-foreground">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                  </div>
                </GlassCard>

                <GlassCard>
                  <h3 className="font-semibold text-foreground mb-3">{t("manager.users.drawer.statusTitle", "Change User Status")}</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="glass-label">{t("manager.users.drawer.nextStatus", "New Status")}</label>
                      <GlassSelect
                        id="manager-user-status"
                        options={statusOptions}
                        onValueChange={(value) => setSelectedUserStatus(value as UserStatus)}
                        placeholder={t("manager.users.drawer.nextStatusPlaceholder", "Select status")}
                        value={selectedUserStatus}
                      />
                    </div>
                    <GlassInput
                      value={statusReason}
                      onChange={(event) => setStatusReason(event.target.value)}
                      label={t("manager.users.drawer.reason", "Reason (optional)")}
                      placeholder={t("manager.users.drawer.reason", "Reason (optional)")}
                    />
                    <GlassButton
                      variant="secondary"
                      className="px-4 py-2"
                      loading={loading.users || submitting}
                      onClick={handleUserStatusUpdate}
                    >
                      {t("manager.users.drawer.updateStatus", "Update Status")}
                    </GlassButton>
                  </div>
                </GlassCard>
              </div>
            ) : null}
          </DrawerContent>
        </Drawer>
        <GlassCard>
          <div className="grid grid-cols-6 sm:flex-row gap-3 mb-4">
            <div className="relative col-span-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <GlassInput placeholder={t("manager.users.search", "Search users...")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <div className="flex items-center gap-2 justify-end">

              <GlassSelect
              options={[
                { value: "all", label: t("manager.users.filter.all", "All Roles") },
                { value: "client", label: t("manager.users.filter.client", "Clients") },
                { value: "cashier", label: t("manager.users.filter.cashier", "Cashiers") },
                { value: "manager", label: t("manager.users.filter.manager", "Managers") },
              ]}
              onValueChange={(value) => setRoleFilter(value)}
              placeholder={t("manager.users.filter.rolePlaceholder", "Filter by role")}
              value={roleFilter}
              />
              </div>
            <div className="flex items-center gap-2 justify-end">
            <GlassSelect
              id="manager-users-page-size"
              value={String(pageSize)}
              onValueChange={(value) => setPageSize(Number(value))}
              options={[
                { value: "5", label: "5" },
                { value: "8", label: "8" },
                { value: "10", label: "10" },
                { value: "20", label: "20" },
              ]}
              />
              </div>
          </div>
          <GlassTable
            columns={[
              {
                key: "user",
                header: t("manager.users.table.user", "User"),
                render: (u) => (
                  <div className="flex items-center gap-2">
                    <img
                      src={u.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`}
                      alt={t("manager.users.table.avatarAlt", "User avatar")}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="font-medium text-foreground">{u.firstName} {u.lastName}</span>
                  </div>
                )
              },
              { key: "email", header: t("manager.users.table.email", "Email") },
              { key: "role", header: t("manager.users.table.role", "Role"), render: (u) => <span className="capitalize">{u.userRoles?.[0]?.role?.name ?? u.userRoles?.[0]?.role?.slug ?? (u as unknown as { roles?: string[] }).roles?.[0]}</span> },
              { key: "status", header: t("manager.users.table.status", "Status"), render: (u) => <span className={getStatusBadgeClass(u.status)}>{u.status.replace("_", " ")}</span> },
              { key: "joined", header: t("manager.users.table.joined", "Joined"), render: (u) => new Date(u.createdAt).toLocaleDateString() },
              {
                key: "actions",
                header: t("manager.users.table.actions", "Actions"),
                render: (u) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-full p-2 hover:bg-secondary/70 transition-colors"
                        aria-label={t("manager.users.table.actions", "Actions")}
                      >
                        <MoreHorizontal className="h-4 w-4 text-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-surface border-border">
                      <DropdownMenuItem onClick={() => openUserDetailsDrawer(u.id)}>
                        {t("manager.users.actions.view", "View user info")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }
            ]}
            data={paginatedUsers.map((u) => ({ ...u, id: String(u.id), joined: u.createdAt }))}
            emptyMessage={t("manager.users.empty", "No users found")}
            loading={loading.users}
          />
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            total={users.length}
            limit={pageSize}
            onPageChange={setCurrentPage}
          />
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default ManagerUsers;
