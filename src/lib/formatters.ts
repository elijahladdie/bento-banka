export const formatCurrency = (amount: number, currency = "RWF"): string => {
  if (currency === "RWF") {
    return `RWF ${new Intl.NumberFormat("en-RW").format(amount)}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
};

export const formatDate = (date: string | Date, locale = "en"): string => {
  const localeMap: Record<string, string> = { en: "en-GB", fr: "fr-FR", kin: "rw-RW" };
  return new Intl.DateTimeFormat(localeMap[locale] ?? "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date, locale = "en"): string => {
  const localeMap: Record<string, string> = { en: "en-GB", fr: "fr-FR", kin: "rw-RW" };
  return new Intl.DateTimeFormat(localeMap[locale] ?? "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const maskAccountNumber = (num: string): string => `${num.slice(0, 4)} **** **** ${num.slice(-4)}`;

export const formatAccountNumber = (num: string): string => num.replace(/(\d{4})(?=\d)/g, "$1 ").trim();

export const getGreeting = (locale = "en"): string => {
  const h = new Date().getHours();
  const greetings: Record<string, string> = {
    en: h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening",
    fr: h < 12 ? "Bonjour" : h < 17 ? "Bon après-midi" : "Bonsoir",
    kin: h < 12 ? "Mwaramutse" : h < 17 ? "Mwiriwe" : "Ijoro ryiza",
  };
  return greetings[locale] ?? greetings.en;
};

export const getTransactionSign = (type: string): string => {
  if (type === "deposit") return "+";
  if (type === "withdraw") return "-";
  return "↔";
};

export const getTransactionColor = (type: string): string => {
  if (type === "deposit") return "var(--success-text)";
  if (type === "withdraw") return "var(--error-text)";
  return "var(--info-text)";
};
