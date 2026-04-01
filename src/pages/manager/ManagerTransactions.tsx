import DashboardLayout from "@/components/DashboardLayout";
import { mockTransactions, formatCurrency, getStatusBadgeClass } from "@/data/mockData";
import { ArrowDownRight, ArrowUpRight, ArrowRightLeft } from "lucide-react";

const ManagerTransactions = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Transaction Monitoring</h1>
        <div className="bento-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">Reference</th>
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-left py-2 font-medium">Amount</th>
                  <th className="text-left py-2 font-medium">Description</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 font-mono text-xs">{t.reference}</td>
                    <td className="py-3 text-muted-foreground text-xs">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1 capitalize">
                        {t.type === "deposit" && <ArrowDownRight className="h-3.5 w-3.5 text-emerald-400" />}
                        {t.type === "withdraw" && <ArrowUpRight className="h-3.5 w-3.5 text-destructive" />}
                        {t.type === "transfer" && <ArrowRightLeft className="h-3.5 w-3.5 text-blue-400" />}
                        {t.type}
                      </div>
                    </td>
                    <td className="py-3 font-medium">{formatCurrency(t.amount)}</td>
                    <td className="py-3 text-muted-foreground text-xs max-w-[200px] truncate">{t.description}</td>
                    <td className="py-3"><span className={getStatusBadgeClass(t.status)}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManagerTransactions;
