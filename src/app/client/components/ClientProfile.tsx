"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import { useUiText } from "@/lib/ui-text";

const ClientProfile = () => {
  const { user } = useAuth();
  const { t } = useUiText();

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{t("nav.profile", "Profile")}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard className="flex flex-col items-center text-center">
            <img src={user?.profilePicture} alt="" className="w-24 h-24 rounded-full ring-4 ring-primary/20 object-cover mb-4" />
            <h2 className="text-xl font-bold text-foreground">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-2">Member since {new Date(user?.createdAt || "").toLocaleDateString()}</p>
            <GlassButton variant="secondary" className="mt-4 px-4 py-2">Change Photo</GlassButton>
          </GlassCard>
          <GlassCard>
            <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
            <div className="space-y-3">
              <GlassInput label="Full Name" defaultValue={`${user?.firstName} ${user?.lastName}`} />
              <GlassInput label="Phone" defaultValue={user?.phoneNumber ?? ""} />
              <GlassInput label="Email" defaultValue={user?.email ?? ""} disabled />
              <GlassInput label="National ID" defaultValue={user?.nationalId ?? ""} disabled />
              <GlassButton variant="primary" className="px-4 py-2">Save Changes</GlassButton>
            </div>
          </GlassCard>
        </div>
        <GlassCard className="max-w-lg">
          <h3 className="font-semibold text-foreground mb-4">Change Password</h3>
          <div className="space-y-3">
            <GlassInput type="password" label="Current Password" />
            <GlassInput type="password" label="New Password" />
            <GlassInput type="password" label="Confirm New Password" />
            <GlassButton variant="primary" className="px-4 py-2">Update Password</GlassButton>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default ClientProfile;
