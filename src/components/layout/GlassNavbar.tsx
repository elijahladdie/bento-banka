"use client";

import { Bell, LogOut, Menu, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import LanguageSwitcher from "./LanguageSwitcher";
import { useUiText } from "@/lib/ui-text";

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
          <button className="btn-icon" onClick={() => router.push(`/${role ?? "client"}/notifications`)}>
            <Bell size={16} />
            <span
              style={{
                marginLeft: 6,
                width: 16,
                height: 16,
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--gold)",
                color: "#0a0f1e",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              0
            </span>
          </button>
        ) : null}

        {showProfile ? (
          <div style={{ position: "relative" }}>
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
              <div className="glass-card" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", minWidth: 180, padding: 8, zIndex: 120 }}>
                <button className="btn-secondary" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => router.push(`/${role ?? "client"}/profile`)}>
                  <User size={14} />
                  {t("layout.profile", "Profile")}
                </button>
                <button className="btn-danger" style={{ width: "100%", marginTop: 8, justifyContent: "flex-start" }} onClick={() => void logout()}>
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
