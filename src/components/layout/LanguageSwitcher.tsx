"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";

const langs = [
  { code: "kin", label: "Kiny", flag: "🇷🇼" },
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
] as const;

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLang = (code: string) => {
    localStorage.setItem("banka_lang", code);
    const parts = pathname.split("/").filter(Boolean);
    if (parts[0] === "kin" || parts[0] === "en" || parts[0] === "fr") {
      parts[0] = code;
      router.push(`/${parts.join("/")}`);
      return;
    }
    router.push(pathname);
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
