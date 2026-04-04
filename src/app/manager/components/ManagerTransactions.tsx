"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { formatCurrency, getStatusBadgeClass } from "@/lib/format";
import { ArrowDownRight, ArrowRightLeft, ArrowUpRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchTransactionsThunk } from "@/store/slices/bankingSlice";
import GlassCard from "@/components/ui/GlassCard";
import PaginationBar from "@/components/ui/PaginationBar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ManagerTransactions = () => {
  const dispatch = useAppDispatch();
  const { transactions } = useAppSelector((state) => state.banking);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    dispatch(fetchTransactionsThunk({ limit: 200 }));
  }, [dispatch]);

  const totalPages = Math.ceil(transactions.length / pageSize);
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return transactions.slice(start, start + pageSize);
  }, [transactions, currentPage]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Transaction Monitoring</h1>
        <GlassCard>
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="border-b border-border text-muted-foreground">
                  <TableHead className="text-left py-2 font-medium">Reference</TableHead>
                  <TableHead className="text-left py-2 font-medium">Date</TableHead>
                  <TableHead className="text-left py-2 font-medium">Type</TableHead>
                  <TableHead className="text-left py-2 font-medium">Amount</TableHead>
                  <TableHead className="text-left py-2 font-medium">Description</TableHead>
                  <TableHead className="text-left py-2 font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTransactions.map((txn) => (
                  <TableRow key={txn.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <TableCell className="py-3 font-mono text-xs">{txn.reference}</TableCell>
                    <TableCell className="py-3 text-muted-foreground text-xs">{new Date(txn.createdAt).toLocaleString()}</TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1 capitalize">
                        {txn.type === "deposit" && <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />}
                        {txn.type === "withdraw" && <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />}
                        {txn.type === "transfer" && <ArrowRightLeft className="h-3.5 w-3.5 text-blue-400" />}
                        {txn.type}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 font-medium">{formatCurrency(Number(txn.amount))}</TableCell>
                    <TableCell className="py-3 text-muted-foreground text-xs max-w-[200px] truncate">{txn.description}</TableCell>
                    <TableCell className="py-3">
                      <span className={getStatusBadgeClass(txn.status)}>{txn.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            total={transactions.length}
            limit={pageSize}
            onPageChange={setCurrentPage}
          />
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default ManagerTransactions;
