const statusMap: Record<string, { cls: string; dot: string; label: string }> = {
  Active: { cls: "badge-active", dot: "#4ade80", label: "Active" },
  active: { cls: "badge-active", dot: "#4ade80", label: "Active" },
  Inactive: { cls: "badge-inactive", dot: "#64748b", label: "Inactive" },
  inactive: { cls: "badge-inactive", dot: "#64748b", label: "Inactive" },
  Dormant: { cls: "badge-dormant", dot: "#fbbf24", label: "Dormant" },
  pending: { cls: "badge-pending", dot: "#60a5fa", label: "Pending" },
  pending_approval: { cls: "badge-pending", dot: "#60a5fa", label: "Pending Approval" },
  suspended: { cls: "badge-withdraw", dot: "#f87171", label: "Suspended" },
  deposit: { cls: "badge-deposit", dot: "#4ade80", label: "Deposit" },
  withdraw: { cls: "badge-withdraw", dot: "#f87171", label: "Withdrawal" },
  transfer: { cls: "badge-transfer", dot: "#60a5fa", label: "Transfer" },
  client: { cls: "badge-client", dot: "#60a5fa", label: "Client" },
  cashier: { cls: "badge-cashier", dot: "#fbbf24", label: "Cashier" },
  manager: { cls: "badge-manager", dot: "#D4AF37", label: "Manager" },
  completed: { cls: "badge-active", dot: "#4ade80", label: "Completed" },
  failed: { cls: "badge-withdraw", dot: "#f87171", label: "Failed" },
  reversed: { cls: "badge-dormant", dot: "#fbbf24", label: "Reversed" },
};

export default function StatusBadge({ value }: { value: string }) {
  const config = statusMap[value] ?? { cls: "badge-inactive", dot: "#64748b", label: value };

  return (
    <span className={`badge ${config.cls}`}>
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: config.dot }} />
      {config.label}
    </span>
  );
}
