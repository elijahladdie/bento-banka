interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function PaginationBar({ currentPage, totalPages, total, limit, onPageChange }: PaginationBarProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), safeTotalPages);
  const pages = Array.from({ length: Math.min(safeTotalPages, 5) }, (_, i) => {
    if (safeTotalPages <= 5) return i + 1;
    if (safeCurrentPage <= 3) return i + 1;
    if (safeCurrentPage >= safeTotalPages - 2) return safeTotalPages - 4 + i;
    return safeCurrentPage - 2 + i;
  });

  const start = total === 0 ? 0 : (safeCurrentPage - 1) * limit + 1;
  const end = Math.min(safeCurrentPage * limit, total);

  return (
    <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 shadow-[0_12px_32px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center">
      <span className="text-sm font-medium text-[var(--text-secondary)]">
        Showing {start}-{end} of {total} items
      </span>
      <div className="flex flex-wrap gap-2">
        <button className="btn-icon" onClick={() => onPageChange(safeCurrentPage - 1)} disabled={safeCurrentPage === 1 || totalPages <= 1}>
          ←
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={
              p === safeCurrentPage
                ? "rounded-xl border border-transparent bg-[var(--gold-gradient)] px-3.5 py-2 text-sm font-semibold text-[#0a0f1e]"
                : "rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3.5 py-2 text-sm font-semibold text-[var(--text-secondary)] transition-[var(--transition-fast)] hover:border-[var(--glass-border-hover)]"
            }
            disabled={totalPages <= 1}
          >
            {p}
          </button>
        ))}
        <button className="btn-icon" onClick={() => onPageChange(safeCurrentPage + 1)} disabled={safeCurrentPage === safeTotalPages || totalPages <= 1}>
          →
        </button>
      </div>
    </div>
  );
}
