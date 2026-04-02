"use client";

import { useEffect, useMemo, useState } from "react";
import en from "../../messages/en.json";
import fr from "../../messages/fr.json";
import kin from "../../messages/kin.json";

type LocaleCode = "en" | "fr" | "kin";

type Dictionary = Record<string, unknown>;

const dictionaries: Record<LocaleCode, Dictionary> = { en, fr, kin };

const getByPath = (dict: Dictionary, path: string): string | undefined => {
  const value = path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in (acc as Dictionary)) {
      return (acc as Dictionary)[part];
    }
    return undefined;
  }, dict);

  return typeof value === "string" ? value : undefined;
};

export function useUiText() {
  const [locale, setLocale] = useState<LocaleCode>("en");

  useEffect(() => {
    const rawLocale = localStorage.getItem("banka_lang");
    if (rawLocale === "en" || rawLocale === "fr" || rawLocale === "kin") {
      setLocale(rawLocale);
    }
  }, []);

  return useMemo(
    () => ({
      locale,
      t: (path: string, fallback?: string) => {
        return getByPath(dictionaries[locale], path) ?? getByPath(dictionaries.en, path) ?? fallback ?? path;
      }
    }),
    [locale]
  );
}
