"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { ArrowRightLeft } from "lucide-react";
import { getActiveClientAccounts } from "@/services/banking.service";

const ClientTransfer = () => {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const accounts = getActiveClientAccounts(user?.id);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Transfer Funds</h1>

        {success ? (
          <div className="bento-card text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="font-bold text-foreground text-lg">Transfer Successful!</h2>
            <p className="text-sm text-muted-foreground mt-1">Ref: TXN-DEMO-{Date.now().toString(36).toUpperCase()}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bento-card space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-foreground">New Transfer</h2>
            </div>
            <div className="space-y-2">
              <Label>From Account</Label>
              <select className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground" required>
                <option value="">Select source account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>••••{a.accountNumber.slice(-4)} ({a.type}) — {formatCurrency(a.balance)}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>To Account Number</Label>
              <Input placeholder="Destination account number" required className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Amount (RWF)</Label>
              <Input type="number" min="1" placeholder="0" required className="bg-secondary border-border" />
            </div>
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input placeholder="Transfer description" maxLength={100} className="bg-secondary border-border" />
            </div>
            <div className="rounded-lg bg-secondary/50 p-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Transaction fee</span>
                <span className="text-foreground font-medium">RWF 0</span>
              </div>
            </div>
            <Button variant="hero" className="w-full" type="submit">Confirm Transfer</Button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClientTransfer;
