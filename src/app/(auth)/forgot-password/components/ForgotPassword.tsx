"use client";

import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const ForgotPassword = () => {
  const router = useRouter();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="bento-card w-full max-w-md">
        <div className="text-center mb-6">
          <Landmark className="h-8 w-8 text-primary mx-auto mb-2" />
          <h2 className="text-xl font-bold text-foreground">Reset Password</h2>
        </div>
        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-muted-foreground text-sm mb-4">Check your email for reset instructions.</p>
            <Button variant="ghost" onClick={() => router.push("/login")}>Back to Login</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="you@banka.rw" required className="bg-secondary border-border" />
            </div>
            <Button variant="hero" className="w-full" type="submit">Send Reset Link</Button>
            <button type="button" onClick={() => router.push("/login")} className="block w-full text-center text-sm text-muted-foreground hover:text-primary">
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
