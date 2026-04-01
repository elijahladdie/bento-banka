"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, getStatusBadgeClass } from "@/data/mockData";
import { CreditCard, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { getClientAccounts } from "@/services/banking.service";

const ClientAccounts = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const accounts = getClientAccounts(user?.id);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const copyAccount = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(num);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">My Accounts</h1>
        </div>
        <div className="bento-grid">
          {accounts.map((a) => (
            <div key={a.id} className="bento-card">
              <div className="flex items-center justify-between mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
                <span className={getStatusBadgeClass(a.status)}>{a.status}</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm text-muted-foreground font-mono">{a.accountNumber}</p>
                <button onClick={() => copyAccount(a.accountNumber)} className="text-muted-foreground hover:text-primary">
                  {copied === a.accountNumber ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="text-sm text-muted-foreground capitalize mb-3">{a.type} Account</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(a.balance)}</p>
              <p className="text-xs text-muted-foreground mt-2">Opened {new Date(a.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientAccounts;
