"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Landmark, LayoutDashboard, CreditCard, ArrowRightLeft, User, Bell, LogOut, Users, BarChart3, CheckSquare, Search } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { useUiText } from "@/lib/ui-text";

interface NavItem {
  labelKey: string;
  path: string;
  icon: React.ElementType;
}

const navByRole: Record<string, NavItem[]> = {
  client: [
    { labelKey: "nav.dashboard", path: "/client/dashboard", icon: LayoutDashboard },
    { labelKey: "nav.accounts", path: "/client/accounts", icon: CreditCard },
    { labelKey: "nav.transfer", path: "/client/transfer", icon: ArrowRightLeft },
    { labelKey: "nav.profile", path: "/client/profile", icon: User },
  ],
  cashier: [
    { labelKey: "nav.dashboard", path: "/cashier/dashboard", icon: LayoutDashboard },
    { labelKey: "nav.clients", path: "/cashier/clients", icon: Search },
  ],
  manager: [
    { labelKey: "nav.dashboard", path: "/manager/dashboard", icon: LayoutDashboard },
    { labelKey: "nav.users", path: "/manager/users", icon: Users },
    { labelKey: "nav.accounts", path: "/manager/accounts", icon: CreditCard },
    { labelKey: "nav.transactions", path: "/manager/transactions", icon: ArrowRightLeft },
    { labelKey: "nav.approvals", path: "/manager/approvals", icon: CheckSquare },
    { labelKey: "nav.statistics", path: "/manager/statistics", icon: BarChart3 },
  ],
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, role } = useAuth();
  const { t } = useUiText();
  const router = useRouter();
  const pathname = usePathname();
  const items = navByRole[role || "client"] || [];

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="relative min-h-screen bg-transparent">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-[var(--glass-border)] bg-[rgba(10,15,30,0.5)] p-4 backdrop-blur-2xl lg:flex">
        <div className="border-b border-[var(--glass-border)] px-2 pb-4">
          <Link href="/" className="flex items-center gap-2">
            <Landmark className="h-7 w-7 text-[var(--text-gold)]" />
            <div>
              <span className="text-lg font-bold text-[var(--text-primary)]">{t("brand.name", "BANKA")}</span>
              <p className="text-xs text-[var(--text-muted)]">{t("brand.slogan", "Bank of Citizens")}</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 px-2 py-4">
          {items.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-semibold transition-[var(--transition-smooth)] ${
                  active
                    ? "border-[rgba(212,175,55,0.4)] bg-[rgba(212,175,55,0.14)] text-[var(--text-gold)]"
                    : "border-transparent text-[var(--text-secondary)] hover:border-[var(--glass-border)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--glass-border)] px-2 pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-2xl border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.12)] px-3 py-3 text-sm font-semibold text-[var(--error-text)] transition-[var(--transition-smooth)] hover:bg-[rgba(239,68,68,0.18)]"
          >
            <LogOut className="h-4 w-4" />
            {t("nav.signOut", "Sign Out")}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-20 border-b border-[var(--glass-border)] bg-[rgba(10,15,30,0.45)] px-4 py-3 backdrop-blur-2xl md:px-6">
          <div className="lg:hidden flex items-center gap-2">
            <Landmark className="h-6 w-6 text-[var(--text-gold)]" />
            <span className="font-bold text-[var(--text-primary)]">{t("brand.name", "BANKA")}</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <button className="relative rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-2 text-[var(--text-secondary)] transition-[var(--transition-smooth)] hover:text-[var(--text-primary)]">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[var(--text-gold)]" />
            </button>
            <GlassCard nohover padding="sm" className="flex items-center gap-2 rounded-2xl border-[var(--glass-border)] bg-[var(--glass-bg)]">
              <img src={user?.profilePicture} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-[rgba(212,175,55,0.22)]" />
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-[var(--text-primary)]">{user?.firstName} {user?.lastName}</p>
                <StatusBadge value={role ?? "client"} />
              </div>
            </GlassCard>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="flex overflow-x-auto border-b border-[var(--glass-border)] bg-[rgba(10,15,30,0.38)] px-2 lg:hidden">
          {items.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-3 text-xs font-semibold transition-colors ${
                  active ? "border-[var(--text-gold)] text-[var(--text-gold)]" : "border-transparent text-[var(--text-muted)]"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {t(item.labelKey)}
              </Link>
            );
          })}
          <button onClick={handleLogout} className="flex items-center gap-1.5 whitespace-nowrap px-3 py-3 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--error-text)]">
            <LogOut className="h-3.5 w-3.5" />
            {t("nav.signOut", "Sign Out")}
          </button>
        </div>

        {/* Content */}
        <main className="fade-slide-in flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
