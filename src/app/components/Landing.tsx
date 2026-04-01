"use client";

import { Shield, ArrowRightLeft, Users, FileText, Clock, Lock, ArrowRight, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AUTH_ROUTES } from "@/constants/routes";
import { useCountUp } from "@/hooks/useCountUp";

const features = [
  { icon: Users, title: "Multi-Account Management", desc: "Create and manage savings, checking, and fixed deposit accounts from one place." },
  { icon: ArrowRightLeft, title: "Instant Transfers", desc: "Transfer funds between your accounts instantly with zero fees." },
  { icon: Shield, title: "Role-Based Security", desc: "Three-tier access control: Clients, Cashiers, and Managers." },
  { icon: FileText, title: "Full Audit Trail", desc: "Every transaction is logged with timestamps and reference numbers." },
  { icon: Clock, title: "24/7 Access", desc: "Access your banking dashboard anytime, anywhere, from any device." },
  { icon: Lock, title: "Bank-Grade Encryption", desc: "Your data is protected with industry-standard encryption protocols." },
];

const stats = [
  { value: 10000, label: "Clients", suffix: "+" },
  { value: 50000, label: "Transactions", suffix: "+" },
  { value: 99.9, label: "Uptime", suffix: "%" },
  { value: 3, label: "Role Levels", suffix: "" },
];

const StatCard = ({ value, label, suffix }: { value: number; label: string; suffix: string }) => {
  const { count, ref } = useCountUp(value);

  return (
    <div ref={ref} className="bento-card text-center">
      <div className="stat-value">
        {value === 99.9 ? "99.9" : count.toLocaleString()}
        {suffix}
      </div>
      <p className="text-muted-foreground mt-2 font-medium">{label}</p>
    </div>
  );
};

const steps = [
  { step: 1, title: "Sign Up", desc: "Create your account in minutes with basic information." },
  { step: 2, title: "Get Approved", desc: "A manager reviews and approves your account." },
  { step: 3, title: "Create Accounts", desc: "Open savings, checking, or fixed deposit accounts." },
  { step: 4, title: "Transact", desc: "Deposit, withdraw, and transfer funds securely." },
];

const Landing = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Landmark className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">BANKA</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push(AUTH_ROUTES.login)}>Sign In</Button>
            <Button variant="hero" onClick={() => router.push(AUTH_ROUTES.signup)}>Open Account</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-72 h-72 bg-primary/10 rounded-full -top-20 -right-20 animate-float" />
          <div className="absolute w-48 h-48 bg-primary/5 rounded-full top-40 left-10 animate-float-delayed" />
          <div className="absolute w-64 h-64 bg-primary/8 rounded-full bottom-10 right-1/3 animate-float-slow" />
        </div>
        <div className="container mx-auto text-center relative z-10">
          <div className="bento-card max-w-3xl mx-auto py-16 px-8">
            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-2">
              Bank of <span className="text-primary">Citizens</span>
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto mb-6 rounded-full" />
            <p className="text-xl text-muted-foreground mb-10 max-w-lg mx-auto">
              Secure. Simple. Yours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" className="px-8 text-base" onClick={() => router.push(AUTH_ROUTES.signup)}> 
                Open an Account <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
              <Button variant="hero-outline" size="lg" className="px-8 text-base" onClick={() => router.push(AUTH_ROUTES.login)}> 
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why <span className="text-primary">BANKA</span>?
          </h2>
          <div className="bento-grid">
            {features.map((f) => (
              <div key={f.title} className="bento-card-hover group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="bento-grid-4">
            {stats.map((s) => (
              <StatCard key={s.label} value={s.value} label={s.label} suffix={s.suffix} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            How It <span className="text-primary">Works</span>
          </h2>
          <div className="bento-grid-4">
            {steps.map((s) => (
              <div key={s.step} className="bento-card text-center relative">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="bento-card text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Landmark className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">BANKA</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">Bank of Citizens — Secure. Simple. Yours.</p>
            <div className="flex justify-center gap-6 text-sm text-muted-foreground">
              <button onClick={() => router.push(AUTH_ROUTES.login)} className="hover:text-primary transition-colors">Sign In</button>
              <button onClick={() => router.push(AUTH_ROUTES.signup)} className="hover:text-primary transition-colors">Sign Up</button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">© 2026 BANKA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
