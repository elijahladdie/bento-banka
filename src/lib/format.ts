export const formatCurrency = (amount: number, currency = "RWF") => {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const getStatusBadgeClass = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === "active" || normalized === "completed") {
    return "badge-active";
  }

  if (normalized === "pending" || normalized === "pending_approval") {
    return "badge-pending";
  }

  if (normalized === "inactive" || normalized === "frozen" || normalized === "failed") {
    return "badge-inactive";
  }

  return "badge-dormant";
};
