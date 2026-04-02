"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRight,
  BarChart2,
  Bell,
  CheckSquare,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUiText } from "@/lib/ui-text";

type Role = "client" | "cashier" | "manager";

interface GlassSidebarProps {
  role: Role;
  open?: boolean;
}

export default function GlassSidebar({ role, open = true }: GlassSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { t } = useUiText();

  const menus: Record<Role, Array<{ icon: typeof LayoutDashboard; labelKey: string; href: string }>> = {
    client: [
      { icon: LayoutDashboard, labelKey: "nav.dashboard", href: "/client/dashboard" },
      { icon: CreditCard, labelKey: "nav.accounts", href: "/client/accounts" },
      { icon: ArrowLeftRight, labelKey: "nav.transfer", href: "/client/transfer" },
      { icon: FileText, labelKey: "nav.transactions", href: "/client/accounts" },
      { icon: Bell, labelKey: "nav.notifications", href: "/client/notifications" },
      { icon: User, labelKey: "nav.profile", href: "/client/profile" },
    ],
    cashier: [
      { icon: LayoutDashboard, labelKey: "nav.dashboard", href: "/cashier/dashboard" },
      { icon: Search, labelKey: "nav.clients", href: "/cashier/clients" },
      { icon: FileText, labelKey: "nav.transactions", href: "/cashier/dashboard" },
    ],
    manager: [
      { icon: LayoutDashboard, labelKey: "nav.dashboard", href: "/manager/dashboard" },
      { icon: Users, labelKey: "nav.users", href: "/manager/users" },
      { icon: CheckSquare, labelKey: "nav.approvals", href: "/manager/approvals" },
      { icon: CreditCard, labelKey: "nav.accounts", href: "/manager/accounts" },
      { icon: FileText, labelKey: "nav.transactions", href: "/manager/transactions" },
      { icon: BarChart2, labelKey: "nav.statistics", href: "/manager/statistics" },
    ],
  };

  return (
    <aside className="glass-sidebar" style={{ transform: open ? "translateX(0)" : "translateX(-110%)", transition: "transform 0.25s ease" }}>
      {menus[role].map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} className={`sidebar-item ${active ? "active" : ""}`}>
            <Icon size={18} />
            <span>{t(item.labelKey)}</span>
          </Link>
        );
      })}

      <div style={{ marginTop: "auto", borderTop: "1px solid var(--glass-border)", paddingTop: 12 }}>
        <button className="sidebar-item" style={{ width: "100%", background: "transparent" }} onClick={() => void logout()}>
          <LogOut size={18} />
          <span>{t("nav.signOut", "Sign Out")}</span>
        </button>
      </div>
    </aside>
  );
}
