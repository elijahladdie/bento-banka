"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient, extractErrorMessage } from "@/lib/api-client";
import { uploadImageToCloudinary, validateProfileImage } from "@/lib/cloudinary";
import { ApiSuccess } from "@/types";
import { useUiText } from "@/lib/ui-text";
import { useToast } from "@/hooks/useToast";

const Signup = () => {
  const router = useRouter();
  const { locale, t } = useUiText();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    nationalId: "",
    dateOfBirth: "",
    address: "",
    password: "",
    confirmPassword: ""
  });

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    return age;
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
      showToast("error", t("auth.signup.failed", "Failed to create account"), validationMessage);
      event.target.value = "";
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      return;
    }

    setProfilePictureFile(file);
    const reader = new FileReader();
    reader.onload = () => setProfilePicturePreview(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      showToast("error", t("auth.signup.passwordMismatch", "Passwords do not match"));
      return;
    }

    const age = calculateAge(form.dateOfBirth);
    if (Number.isNaN(age) || age < 18) {
      showToast("error", t("auth.signup.ageRequired", "You must be at least 18 years old"));
      return;
    }

    setLoading(true);

    try {
      let profilePictureUrl: string | null = null;
      if (profilePictureFile) {
        profilePictureUrl = await uploadImageToCloudinary(profilePictureFile);
      }

      await apiClient.post<ApiSuccess<unknown>>("/auth/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        nationalId: form.nationalId,
        password: form.password,
        age,
        preferredLanguage: locale,
        roleSlug: "client",
        profilePicture: profilePictureUrl
      });
      setLoading(false);
      showToast("success", t("auth.signup.successTitle", "Account Created!"), t("auth.signup.successBody", "Your account is pending manager approval. You'll be notified by email."));
      setSuccess(true);
      setTimeout(() => router.push("/login"), 5000);
    } catch (error: any) {
      setLoading(false);
      const responseData = (error as { response?: { data?: { message?: string; errors?: Array<{ field?: string; message?: string }> } } })?.response?.data;
      const title = responseData?.message ?? t("auth.signup.failed", "Failed to create account");
      const validationDetails = Array.isArray(responseData?.errors)
        ? responseData.errors
            .map((item) => {
              const cleanField = (item.field ?? "field").replace(/^body\./, "");
              return `${cleanField}: ${item.message ?? "Invalid value"}`;
            })
            .join("\n")
        : typeof error.message === "string"
        ? extractErrorMessage(error.message, t("auth.signup.failed", "Failed to create account")) :
        typeof error === "string" ? extractErrorMessage(error, t("auth.signup.failed", "Failed to create account")) : null;

      showToast("error", title, validationDetails);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <GlassCard className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{t("auth.signup.successTitle", "Account Created!")}</h2>
          <p className="text-muted-foreground text-sm">{t("auth.signup.successBody", "Your account is pending manager approval. You'll be notified by email.")}</p>
          <p className="text-xs text-muted-foreground mt-4">{t("auth.signup.redirecting", "Redirecting to login...")}</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <GlassCard className="fade-slide-in relative z-10 w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Landmark className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">BANKA</span>
          </div>
          <p className="text-muted-foreground text-sm">{t("auth.signup.title", "Create your account")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <GlassInput label={t("auth.signup.firstName", "First Name")} placeholder="Jean" required value={form.firstName} onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <GlassInput label={t("auth.signup.lastName", "Last Name")} placeholder="Pierre" required value={form.lastName} onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <GlassInput type="email" label={t("auth.signup.email", "Email")} placeholder="you@email.com" required value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <GlassInput label={t("auth.signup.phone", "Phone Number")} placeholder="+250788123456" required value={form.phoneNumber} onChange={(event) => setForm((prev) => ({ ...prev, phoneNumber: event.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <GlassInput label={t("auth.signup.nationalId", "National ID")} placeholder="1199506123456789" required value={form.nationalId} onChange={(event) => setForm((prev) => ({ ...prev, nationalId: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <GlassInput type="date" label={t("auth.signup.dob", "Date of Birth")} required value={form.dateOfBirth} onChange={(event) => setForm((prev) => ({ ...prev, dateOfBirth: event.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <GlassInput label={t("auth.signup.address", "Address")} placeholder="Kigali, Rwanda" required value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} />
          </div>
          <div className="space-y-2">
            <label className="glass-label">{t("auth.signup.profilePicture", "Profile Picture (optional)")}</label>
            <input
              type="file"
              accept="image/*"
              className="glass-input !px-4 !py-3 file:mr-3 file:rounded-full file:border-0 file:bg-primary/20 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary"
              onChange={handleProfilePictureChange}
            />
            <p className="text-xs text-muted-foreground">{t("auth.signup.profilePictureHint", "Image only, max 2MB")}</p>
            {profilePicturePreview ? (
              <img src={profilePicturePreview} alt="profile preview" className="h-20 w-20 rounded-full border border-[var(--glass-border)] object-cover" />
            ) : null}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <GlassInput type="password" label={t("auth.signup.password", "Password")} placeholder="••••••••" required value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <GlassInput type="password" label={t("auth.signup.confirmPassword", "Confirm Password")} placeholder="••••••••" required value={form.confirmPassword} onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="terms" required />
            <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">{t("auth.signup.terms", "I agree to the Terms & Conditions")}</label>
          </div>

          <GlassButton className="w-full" type="submit" loading={loading} loadingText={t("common.loading", "Loading...")}>{t("auth.signup.submit", "Create Account")}</GlassButton>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {t("auth.signup.loginPrompt", "Already have an account?")} {" "}
          <button onClick={() => router.push("/login")} className="text-primary hover:underline font-medium">{t("auth.signup.login", "Sign In")}</button>
        </p>
      </GlassCard>
    </div>
  );
};

export default Signup;
