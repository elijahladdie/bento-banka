"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Landmark, Eye, EyeOff } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassInput from "@/components/ui/GlassInput";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { AUTH_ROUTES } from "@/constants/routes";
import { getDashboardRouteByRole } from "@/services/auth.service";
import { useUiText } from "@/lib/ui-text";
import { useToast } from "@/hooks/useToast";

const Login = () => {
  const router = useRouter();
  const { login, isAuthenticated, role, initialized } = useAuth();
  const { t } = useUiText();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const frontendState = (process.env.FRONTEND_STATE ?? "client").toLowerCase();

  useEffect(() => {
    if (!initialized) return;

    if (isAuthenticated) {
      router.replace(getDashboardRouteByRole((role as "client" | "cashier" | "manager" | null) ?? null));
    }
  }, [initialized, isAuthenticated, role, router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      const role = "role" in result ? result.role : null;
      router.push(getDashboardRouteByRole((role as "client" | "cashier" | "manager" | null) ?? null));
    } else {
      showToast("error", result.error || t("auth.login.failed", "Login failed"));
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 animate-orb-float" />
        <div className="absolute bottom-20 left-10 h-48 w-48 rounded-full bg-primary/5 animate-orb-float" />
      </div>
      <GlassCard className="fade-slide-in relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Landmark className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">BANKA</span>
          </div>
          <p className="text-muted-foreground text-sm">{t("brand.slogan", "Bank of Citizens")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <GlassInput id="email" type="email" label={t("auth.login.email", "Email Address")} placeholder="you@banka.rw" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <div className="relative">
              <GlassInput id="password" type={showPassword ? "text" : "password"} label={t("auth.login.password", "Password")} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="pr-10"
                icon={showPassword ? <EyeOff className="h-4 w-4" onClick={() => setShowPassword(!showPassword)} /> : <Eye className="h-4 w-4" onClick={() => setShowPassword(!showPassword)} />}
                iconPosition="right"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">{t("auth.login.remember", "Remember me")}</label>
            </div>
            <button type="button" onClick={() => router.push(AUTH_ROUTES.forgotPassword)} className="text-sm text-primary hover:underline">{t("auth.login.forgot", "Forgot Password?")}</button>
          </div>

          <GlassButton className="w-full" type="submit" disabled={loading} loading={loading} loadingText={t("common.loading", "Loading...")}>{t("auth.login.submit", "Sign In")}</GlassButton>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("auth.login.signupPrompt", "Don't have an account?")} {" "}
          <button onClick={() => router.push(AUTH_ROUTES.signup)} className="text-primary hover:underline font-medium">{t("auth.login.signup", "Sign Up")}</button>
        </p>

        {frontendState === "sandbox" && (
          <div className="mt-6 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
            <p className="mb-2 text-center text-xs font-medium text-muted-foreground">{t("auth.login.demoHint", "Demo Accounts (any password):")}</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="text-primary">{t("auth.login.client", "Client")}:</span> jean.pierre@banka.rw</p>
              <p><span className="text-primary">{t("auth.login.cashier", "Cashier")}:</span> amina.uwase@banka.rw</p>
              <p><span className="text-primary">{t("auth.login.manager", "Manager")}:</span> eric.nkurunziza@banka.rw</p>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Login;
