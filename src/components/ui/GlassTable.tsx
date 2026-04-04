import { type ReactNode } from "react";
import GlassCard from "./GlassCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

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
        <Table className="glass-table" role="table">
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} style={{ textAlign: col.align ?? "left" }} scope="col">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, rowIdx) => (
                  <TableRow key={`skeleton-${rowIdx}`}>
                    {columns.map((col, colIdx) => (
                      <TableCell key={`${col.key}-${colIdx}`}>
                        <div className="glass-skeleton h-3 rounded-lg" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : data.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="py-12 text-center text-[var(--text-muted)]">
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                )
                : data.map((row) => (
                  <TableRow key={row.id} onClick={() => onRowClick?.(row)} className={onRowClick ? "cursor-pointer" : "cursor-default"}>
                    {columns.map((col) => (
                      <TableCell key={col.key} style={{ textAlign: col.align ?? "left" }}>
                        {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
    </GlassCard>
  );
}
