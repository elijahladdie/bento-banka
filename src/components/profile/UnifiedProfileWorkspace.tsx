"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import { useUiText } from "@/lib/ui-text";
import { uploadImageToCloudinary, validateProfileImage } from "@/lib/cloudinary";
import { changePasswordThunk, fetchMeThunk, updateProfileThunk } from "@/store/slices/authSlice";
import type { AppDispatch, RootState } from "@/store";
import { useToast } from "@/hooks/useToast";

export default function UnifiedProfileWorkspace() {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useUiText();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  const { showToast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMeThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;

    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setPhoneNumber(user.phoneNumber || "");
    if (user.profilePicture) {
      setProfilePicturePreview(user.profilePicture);
    }
  }, [user]);

  useEffect(() => {
    if (!error) return;
    showToast({ type: "error", message: error });
  }, [error, showToast]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProfilePictureFile(null);
      return;
    }

    const validationMessage = validateProfileImage(file);
    if (validationMessage) {
      showToast({ type: "error", message: validationMessage });
      e.target.value = "";
      setProfilePictureFile(null);
      return;
    }

    setProfilePictureFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validatePasswordChange = () => {
    if (!currentPassword.trim()) {
      showToast({ type: "warning", message: t("profile.currentPasswordRequired", "Current password is required") });
      return false;
    }

    if (!newPassword.trim()) {
      showToast({ type: "warning", message: t("profile.newPasswordRequired", "New password is required") });
      return false;
    }

    if (newPassword.length < 8) {
      showToast({ type: "warning", message: t("profile.passwordMinLength", "Password must be at least 8 characters") });
      return false;
    }

    if (newPassword !== confirmPassword) {
      showToast({ type: "error", message: t("profile.passwordMismatch", "New password and confirm password do not match") });
      return false;
    }

    return true;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      showToast({ type: "error", message: t("profile.updateError", "Failed to update profile") });
      return;
    }
    setProfileLoading(true);

    try {
      let profilePicture = user?.profilePicture ?? undefined;
      if (profilePictureFile) {
        profilePicture = await uploadImageToCloudinary(profilePictureFile);
      }

      await dispatch(
        updateProfileThunk({
          userId: user.id,
          data: {
            firstName,
            lastName,
            phoneNumber,
            profilePicture,
          },
        })
      ).unwrap();
      await dispatch(fetchMeThunk());
      showToast({ type: "success", message: t("profile.updateSuccess", "Profile updated successfully") });
      setProfilePictureFile(null);
    } catch (err: unknown) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : t("profile.updateError", "Failed to update profile"),
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordChange()) return;

    setPasswordLoading(true);

    try {
      await dispatch(
        changePasswordThunk({
          currentPassword,
          newPassword,
        })
      ).unwrap();

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast({ type: "success", message: t("profile.passwordUpdateSuccess", "Password updated successfully") });
    } catch (err: unknown) {
      showToast({
        type: "error",
        message: err instanceof Error ? err.message : t("profile.passwordUpdateError", "Failed to update password"),
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "";

    try {
      return new Date(date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary"></div>
            <p className="text-muted-foreground">{t("common.loading", "Loading...")}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">{t("profile.title", "Profile")}</h1>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GlassCard className="flex flex-col items-center text-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group relative mb-4 cursor-pointer"
              type="button"
              aria-label={t("profile.changePhoto", "Change Photo")}
            >
              <img
                src={profilePicturePreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`}
                alt={`${user?.firstName} ${user?.lastName}`}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all duration-300 group-hover:bg-black/30">
                <span className="text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  {t("profile.changePhoto", "Change Photo")}
                </span>
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
              aria-label={t("profile.selectPhoto", "Select photo")}
            />
            <p className="mb-2 text-xs text-muted-foreground">{t("profile.photoHint", "Image only, max 2MB")}</p>

            <h2 className="text-xl font-bold text-foreground">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("profile.memberSince", "Member since")} {formatDate(user?.createdAt)}
            </p>
          </GlassCard>

          <GlassCard>
            <h3 className="mb-4 font-semibold text-foreground">{t("profile.personalInfo", "Personal Information")}</h3>

            <form onSubmit={handleProfileUpdate} className="space-y-3">
              <GlassInput
                label={t("profile.firstName", "First Name")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t("profile.firstName", "First Name")}
              />
              <GlassInput
                label={t("profile.lastName", "Last Name")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t("profile.lastName", "Last Name")}
              />
              <GlassInput
                label={t("profile.phone", "Phone")}
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder={t("profile.phone", "Phone")}
              />
              <GlassInput
                label={t("profile.email", "Email")}
                value={user?.email || ""}
                disabled
                placeholder={t("profile.email", "Email")}
              />
              <GlassInput
                label={t("profile.nationalId", "National ID")}
                value={user?.nationalId || ""}
                disabled
                placeholder={t("profile.nationalId", "National ID")}
              />

              <GlassButton variant="primary" className="w-full px-4 py-2" disabled={profileLoading} type="submit">
                {profileLoading ? t("common.saving", "Saving...") : t("profile.saveChanges", "Save Changes")}
              </GlassButton>
            </form>
          </GlassCard>
        </div>

        <GlassCard className="max-w-lg">
          <h3 className="mb-4 font-semibold text-foreground">{t("profile.changePassword", "Change Password")}</h3>
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <GlassInput
              type="password"
              label={t("profile.currentPassword", "Current Password")}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={t("profile.currentPassword", "Current Password")}
            />
            <GlassInput
              type="password"
              label={t("profile.newPassword", "New Password")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t("profile.newPassword", "New Password")}
            />
            <GlassInput
              type="password"
              label={t("profile.confirmNewPassword", "Confirm New Password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("profile.confirmNewPassword", "Confirm New Password")}
            />

            <GlassButton variant="primary" className="w-full px-4 py-2" disabled={passwordLoading} type="submit">
              {passwordLoading ? t("common.saving", "Saving...") : t("profile.updatePassword", "Update Password")}
            </GlassButton>
          </form>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
