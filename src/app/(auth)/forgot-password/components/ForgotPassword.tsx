"use client";

import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import { useState } from "react";
import { apiClient, extractErrorMessage } from "@/lib/api-client";
import type { ApiSuccess } from "@/types";
import { useUiText } from "@/lib/ui-text";

const ForgotPassword = () => {
  const router = useRouter();
  const { t } = useUiText();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiClient.post<ApiSuccess<unknown>>("/auth/forgot-password", { email });
      setSent(true);
    } catch (error) {
      setError(extractErrorMessage(error, "Failed to send reset instructions"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <GlassCard className="w-full max-w-md">
        <div className="text-center mb-6">
          <Landmark className="h-8 w-8 text-primary mx-auto mb-2" />
          <h2 className="text-xl font-bold text-foreground">{t("auth.forgot.title", "Reset Password")}</h2>
        </div>
        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-muted-foreground text-sm mb-4">{t("auth.forgot.success", "Check your email for reset instructions.")}</p>
            <GlassButton variant="secondary" onClick={() => router.push("/login")}>{t("auth.forgot.back", "Back to Login")}</GlassButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <GlassInput type="email" label={t("auth.forgot.email", "Email")} placeholder="you@banka.rw" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}
            <GlassButton className="w-full" type="submit" disabled={loading} loading={loading} loadingText={t("auth.forgot.sending", "Sending...")}>{t("auth.forgot.submit", "Send Reset Link")}</GlassButton>
            <button type="button" onClick={() => router.push("/login")} className="block w-full text-center text-sm text-muted-foreground hover:text-primary">
              {t("auth.forgot.back", "Back to Login")}
            </button>
          </form>
        )}
      </GlassCard>
    </div>
  );
};

export default ForgotPassword;
