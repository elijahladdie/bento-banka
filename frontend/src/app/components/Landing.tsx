"use client";

import { Shield, ArrowRightLeft, Users, FileText, Clock, Lock, ArrowRight, Landmark } from "lucide-react";
import { useRouter } from "next/navigation";
import { AUTH_ROUTES } from "@/constants/routes";
import { useCountUp } from "@/hooks/useCountUp";
import GlassButton from "@/components/ui/GlassButton";
import GlassCard from "@/components/ui/GlassCard";
import AmbientBackground from "@/components/ui/AmbientBackground";
import { useUiText } from "@/lib/ui-text";
import Footer from "@/components/layout/Footer";

const features = [
  { icon: Users, titleKey: "landing.features.multiAccount.title", descKey: "landing.features.multiAccount.desc" },
  { icon: ArrowRightLeft, titleKey: "landing.features.transfers.title", descKey: "landing.features.transfers.desc" },
  { icon: Shield, titleKey: "landing.features.roles.title", descKey: "landing.features.roles.desc" },
  { icon: FileText, titleKey: "landing.features.audit.title", descKey: "landing.features.audit.desc" },
  { icon: Clock, titleKey: "landing.features.uptime.title", descKey: "landing.features.uptime.desc" },
  { icon: Lock, titleKey: "landing.features.encryption.title", descKey: "landing.features.encryption.desc" },
];

const stats = [
  { value: 10000, labelKey: "landing.stats.clients", suffix: "+" },
  { value: 50000, labelKey: "landing.stats.transactions", suffix: "+" },
  { value: 99.9, labelKey: "landing.stats.uptime", suffix: "%" },
  { value: 3, labelKey: "landing.stats.roles", suffix: "" },
];


const StatCard = ({ value, label, suffix }: { value: number; label: string; suffix: string }) => {
  const { count, ref } = useCountUp(value);

  return (
    <div ref={ref}>
      <GlassCard className="p-4 text-center">
        <div className="text-xl font-bold text-foreground">
          {value === 99.9 ? "99.9" : count.toLocaleString()}
          {suffix}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {label}
        </p>
      </GlassCard>
    </div>
  );
};

const steps = [
  { step: 1, titleKey: "landing.steps.signUp.title", descKey: "landing.steps.signUp.desc" },
  { step: 2, titleKey: "landing.steps.approved.title", descKey: "landing.steps.approved.desc" },
  { step: 3, titleKey: "landing.steps.accounts.title", descKey: "landing.steps.accounts.desc" },
  { step: 4, titleKey: "landing.steps.transact.title", descKey: "landing.steps.transact.desc" },
];

const Landing = () => {
  const router = useRouter();
  const { t } = useUiText();

  return (
    <div className="min-h-screen bg-background">
      <AmbientBackground />
      {/* Nav */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--glass-border)] bg-[rgba(10,15,30,0.55)] backdrop-blur-2xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Landmark className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">BANKA</span>
          </div>
          <div className="flex items-center gap-3">
            <GlassButton variant="secondary" onClick={() => router.push(AUTH_ROUTES.login)}>{t("landing.signIn", "Sign In")}</GlassButton>
            <GlassButton onClick={() => router.push(AUTH_ROUTES.signup)}>{t("landing.openAccount", "Open an Account")}</GlassButton>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 animate-orb-float" />
          <div className="absolute left-10 top-40 h-48 w-48 rounded-full bg-primary/5 animate-orb-float" />
          <div className="absolute bottom-10 right-1/3 h-64 w-64 rounded-full bg-primary/8 animate-orb-float" />
        </div>
        <div className="container mx-auto text-center relative z-10">
          <GlassCard className="mx-auto max-w-3xl py-16 px-8">
            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-2">
              {t("landing.heroTitle", "Bank of Citizens")}
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto mb-6 rounded-full" />
            <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto">
              {t("landing.heroSubtitle", "Secure. Simple. Yours.")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <GlassButton className="px-8 text-base flex flex-row" onClick={() => router.push(AUTH_ROUTES.signup)}>
                {t("landing.openAccount", "Open an Account")} <ArrowRight className="ml-1 h-5 w-5" />
              </GlassButton>
              <GlassButton variant="secondary" className="px-8 text-base" onClick={() => router.push(AUTH_ROUTES.login)}>
                {t("landing.signIn", "Sign In")}
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {t("landing.whyTitle", "Why BANKA?")}
          </h2>
          <div className="bento-grid">
            {features.map((f) => (
              <GlassCard key={f.titleKey} className="group glass-surface-lift">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t(f.titleKey)}</h3>
                <p className="text-muted-foreground text-sm">{t(f.descKey)}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
      {/* Stats */}
      <section className="py-20 px-4">
        <div className="container mx-auto">

          {/* Title */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-foreground">
              {t("landing.statsTitle", "Platform Stats")}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              {t("landing.statsSubtitle", "Trusted performance at scale")}
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <StatCard
                key={s.labelKey}
                value={s.value}
                label={t(s.labelKey)}
                suffix={s.suffix}
              />
            ))}
          </div>

        </div>
      </section>

      {/* How It Works */}
      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">

          {/* Title */}
          <div className="text-center mb-12 max-w-xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground">
              {t("landing.howTitle")}
            </h2>
            <p className="text-sm text-muted-foreground mt-3">
              {t("landing.howSubtitle", "Start banking in minutes with a simple process")}
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <GlassCard
                key={s.step}
                className="p-6 flex flex-col gap-4 hover:scale-[1.02] transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                    {s.step}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {t(s.titleKey)}
                  </h3>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(s.descKey)}
                </p>
              </GlassCard>
            ))}
          </div>

        </div>
      </section>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
