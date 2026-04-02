"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient, extractErrorMessage } from "@/lib/api-client";
import { ApiSuccess } from "@/types";
import { useUiText } from "@/lib/ui-text";

const Signup = () => {
  const router = useRouter();
  const { t } = useUiText();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const age = calculateAge(form.dateOfBirth);
    if (Number.isNaN(age) || age < 18) {
      setError("You must be at least 18 years old");
      return;
    }

    setLoading(true);

    try {
      await apiClient.post<ApiSuccess<unknown>>("/auth/register", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        nationalId: form.nationalId,
        password: form.password,
        age,
        roleSlug: "client",
        profilePicture: null
      });
      setLoading(false);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 5000);
    } catch (error) {
      setLoading(false);
      setError(extractErrorMessage(error, "Failed to create account"));
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <GlassInput type="password" label={t("auth.signup.password", "Password")} placeholder="••••••••" required value={form.password} onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <GlassInput type="password" label={t("auth.signup.confirmPassword", "Confirm Password")} placeholder="••••••••" required value={form.confirmPassword} onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))} />
            </div>
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

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
