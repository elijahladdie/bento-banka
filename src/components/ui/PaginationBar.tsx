interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function PaginationBar({ currentPage, totalPages, total, limit, onPageChange }: PaginationBarProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  const start = (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  return (
    <div className="mt-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <span className="text-sm text-[var(--text-muted)]">
        Showing {start}-{end} of {total} items
      </span>
      <div className="flex gap-2">
        <button className="btn-icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          ←
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={
              p === currentPage
                ? "rounded-xl border border-transparent bg-[var(--gold-gradient)] px-3.5 py-2 text-sm font-semibold text-[#0a0f1e]"
                : "rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-[var(--transition-fast)] hover:border-[var(--glass-border-hover)]"
            }
          >
            {p}
          </button>
        ))}
        <button className="btn-icon" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          →
        </button>
      </div>
    </div>
  );
}
