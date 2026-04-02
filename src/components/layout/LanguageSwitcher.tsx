"use client";

import { useState, useEffect } from "react";

const langs = [
  { code: "kin", label: "Kiny", flag: "🇷🇼" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
] as const;

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("banka_lang");
    if (saved) setLocale(saved);
  }, []);

  const switchLang = (code: string) => {
    localStorage.setItem("banka_lang", code);
    setLocale(code);
    // Reload to pick up new language
    window.location.reload();
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
