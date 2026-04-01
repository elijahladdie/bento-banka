"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { mockAccounts, formatCurrency, getStatusBadgeClass } from "@/data/mockData";

const ManagerAccounts = () => {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Account Management</h1>
        <div className="bento-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-2 font-medium">Account #</th>
                  <th className="text-left py-2 font-medium">Client</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-left py-2 font-medium">Balance</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {mockAccounts.map((a) => (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 font-mono text-xs">{a.accountNumber}</td>
                    <td className="py-3 text-foreground">{a.owner.firstName} {a.owner.lastName}</td>
                    <td className="py-3 capitalize">{a.type}</td>
                    <td className="py-3 font-medium text-primary">{formatCurrency(a.balance)}</td>
                    <td className="py-3"><span className={getStatusBadgeClass(a.status)}>{a.status}</span></td>
                    <td className="py-3 text-muted-foreground text-xs">{new Date(a.createdAt).toLocaleDateString()}</td>
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

export default ManagerAccounts;
