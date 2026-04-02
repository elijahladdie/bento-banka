import { type ReactNode } from "react";
import GlassCard from "./GlassCard";

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  align?: "left" | "right" | "center";
}

interface GlassTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  loading?: boolean;
}

export default function GlassTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "No data found",
  onRowClick,
  loading,
}: GlassTableProps<T>) {
  return (
    <GlassCard padding="none" nohover>
      <div className="overflow-x-auto">
        <table className="glass-table" role="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={{ textAlign: col.align ?? "left" }} scope="col">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, rowIdx) => (
                  <tr key={`skeleton-${rowIdx}`}>
                    {columns.map((col, colIdx) => (
                      <td key={`${col.key}-${colIdx}`}>
                        <div className="glass-skeleton h-3 rounded-lg" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
                ? (
                  <tr>
                    <td colSpan={columns.length} className="py-12 text-center text-[var(--text-muted)]">
                      {emptyMessage}
                    </td>
                  </tr>
                )
                : data.map((row) => (
                  <tr key={row.id} onClick={() => onRowClick?.(row)} className={onRowClick ? "cursor-pointer" : "cursor-default"}>
                    {columns.map((col) => (
                      <td key={col.key} style={{ textAlign: col.align ?? "left" }}>
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
