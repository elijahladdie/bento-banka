"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateProfileThunk } from "@/store/slices/authSlice";
import { getPreferredLanguage, type SupportedLanguage } from "@/lib/api-client";

const langs = [
  { code: "kin", label: "Kiny", flag: "🇷🇼" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
] as const;

export default function LanguageSwitcher() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [locale, setLocale] = useState<SupportedLanguage>(() => getPreferredLanguage());

  useEffect(() => {
    setLocale(getPreferredLanguage());
  }, []);

  const switchLang = async (code: SupportedLanguage) => {
    const previousLanguage = getPreferredLanguage();
    setLocale(code);

    if (!user?.id) {
      localStorage.setItem("banka_lang", code);
      window.location.reload();
      return;
    }

    try {
      await dispatch(
        updateProfileThunk({
          userId: user.id,
          data: {
            firstName: user.firstName,
            lastName: user.lastName ?? undefined,
            phoneNumber: user.phoneNumber ?? undefined,
            profilePicture: user.profilePicture ?? undefined,
            preferredLanguage: code
          }
        })
      ).unwrap();

      window.location.reload();
    } catch {
      const fallback = previousLanguage;
      setLocale(fallback);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        borderRadius: 50,
        border: "1px solid var(--glass-border)",
        overflow: "hidden",
        backdropFilter: "blur(10px)",
        background: "var(--glass-bg)",
      }}
    >
      {langs.map((lang, i) => (
        <button
          key={lang.code}
          onClick={() => switchLang(lang.code)}
          style={{
            padding: "6px 14px",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.15s ease",
            borderRight: i < langs.length - 1 ? "1px solid var(--glass-border)" : "none",
            background: locale === lang.code ? "var(--gold-gradient)" : "transparent",
            color: locale === lang.code ? "#0a0f1e" : "var(--text-secondary)",
            borderTop: "none",
            borderBottom: "none",
            borderLeft: "none",
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span>{lang.flag}</span>
          <span>{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
