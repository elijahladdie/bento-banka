"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ClientProfile = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bento-card flex flex-col items-center text-center">
            <img src={user?.profilePicture} alt="" className="w-24 h-24 rounded-full ring-4 ring-primary/20 object-cover mb-4" />
            <h2 className="text-xl font-bold text-foreground">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground mt-2">Member since {new Date(user?.createdAt || "").toLocaleDateString()}</p>
            <Button variant="outline" className="mt-4" size="sm">Change Photo</Button>
          </div>
          <div className="bento-card">
            <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Full Name</Label><Input defaultValue={`${user?.firstName} ${user?.lastName}`} className="bg-secondary border-border" /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input defaultValue={user?.phoneNumber} className="bg-secondary border-border" /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input defaultValue={user?.email} disabled className="bg-secondary border-border opacity-60" /></div>
              <div className="space-y-1.5"><Label>National ID</Label><Input defaultValue={user?.nationalId} disabled className="bg-secondary border-border opacity-60" /></div>
              <Button variant="hero" size="sm">Save Changes</Button>
            </div>
          </div>
        </div>
        <div className="bento-card max-w-lg">
          <h3 className="font-semibold text-foreground mb-4">Change Password</h3>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Current Password</Label><Input type="password" className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label>New Password</Label><Input type="password" className="bg-secondary border-border" /></div>
            <div className="space-y-1.5"><Label>Confirm New Password</Label><Input type="password" className="bg-secondary border-border" /></div>
            <Button variant="hero" size="sm">Update Password</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientProfile;
