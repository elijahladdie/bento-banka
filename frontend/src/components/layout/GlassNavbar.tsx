"use client";

import { Bell, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LanguageSwitcher from "./LanguageSwitcher";
import { useUiText } from "@/lib/ui-text";
import { useNotifications } from "@/context/NotificationContext";
import NotificationPopup from "@/components/ui/NotificationPopup";

interface GlassNavbarProps {
  showNotifications?: boolean;
  showProfile?: boolean;
  onMenuClick?: () => void;
}

export default function GlassNavbar({ showNotifications = true, showProfile = true, onMenuClick }: GlassNavbarProps) {
  const { user, role, logout } = useAuth();
  const { t } = useUiText();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const initials = `${user?.firstName?.[0] ?? "B"}${user?.lastName?.[0] ?? "K"}`;

  return (
    <header className="glass-navbar">
      <div className="flex items-center gap-3">
        <button className="btn-icon" onClick={() => onMenuClick?.()} style={{ display: "inline-flex" }}>
          <Menu size={16} />
        </button>
        <div style={{ fontSize: "1.1rem" }}>🏦</div>
        <div>
          <div
            style={{
              fontWeight: 800,
              background: "var(--gold-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {t("brand.name", "BANKA")}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>{t("layout.bankOfCitizens", "Bank of Citizens")}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />

        {showNotifications ? (
          <div style={{ position: "relative" }}>
            <NotificationBell />
            <NotificationPopup />
          </div>
        ) : null}

        {showProfile ? (
          <div className="relative">
            <button className="btn-icon" onClick={() => setOpen((s) => !s)}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="profile" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--gold-gradient)",
                    color: "#0a0f1e",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {initials}
                </span>
              )}
            </button>
            {open ? (

              <div className="glass-card right-0  min-w-[180px] mt-2 p-2 z-50 flex flex-col gap-4 top-[calc(100% + 8px)] bg-[#0a0f1ef2]" style={{ position: "absolute", background:"#0a0f1ef2" }}>
                <button className="btn-secondary flex items-center gap-2 whitespace-nowrap w-full" onClick={() => router.push(`/profile`)}>
                  <User size={14} />
                  {t("layout.profile", "Profile")}
                </button>
                <button className="btn-danger flex items-center gap-2 whitespace-nowrap" onClick={() => void logout()}>
                  <LogOut size={14} />
                  {t("nav.signOut", "Sign Out")}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function NotificationBell() {
  const { unreadCount, togglePopup, isOpen } = useNotifications();

  return (
    <button
      id="notification-bell"
      className="btn-icon"
      onClick={togglePopup}
      aria-label="Notifications"
      style={{
        position: "relative",
        background: isOpen ? "var(--glass-bg-active)" : "var(--glass-bg)",
        borderColor: isOpen ? "var(--gold)" : "var(--glass-border)",
        width: 40,
        height: 40,
      }}
    >
      <Bell
        size={18}
        color={isOpen ? "var(--gold)" : "var(--text-secondary)"}
        style={{
          animation: unreadCount > 0 ? "bellRing 2s ease-in-out infinite" : "none",
        }}
      />

      {unreadCount > 0 && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            minWidth: 18,
            height: 18,
            background: "var(--gold-gradient)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 50,
            color: "#0a0f1e",
            fontSize: "0.65rem",
            fontWeight: 700,
            padding: "0 5px",
            border: "2px solid #0a0f1e",
            lineHeight: 1,
          }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
