import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Landmark, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      const stored = JSON.parse(localStorage.getItem("banka_user") || "{}");
      const role = stored?.userRoles?.[0]?.role?.slug;
      if (role === "manager") navigate("/manager/dashboard");
      else if (role === "cashier") navigate("/cashier/dashboard");
      else navigate("/client/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-72 h-72 bg-primary/10 rounded-full -top-20 -right-20 animate-float" />
        <div className="absolute w-48 h-48 bg-primary/5 rounded-full bottom-20 left-10 animate-float-delayed" />
      </div>
      <div className="bento-card w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Landmark className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">BANKA</span>
          </div>
          <p className="text-muted-foreground text-sm">Bank of Citizens</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@banka.rw" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-secondary border-border" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-secondary border-border pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">Remember me</Label>
            </div>
            <button type="button" onClick={() => navigate("/forgot-password")} className="text-sm text-primary hover:underline">Forgot Password?</button>
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

          <Button variant="hero" className="w-full" type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <button onClick={() => navigate("/signup")} className="text-primary hover:underline font-medium">Sign Up</button>
        </p>

        {/* Quick login hint for demo */}
        <div className="mt-6 p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground text-center mb-2 font-medium">Demo Accounts (any password):</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p><span className="text-primary">Client:</span> jean.pierre@banka.rw</p>
            <p><span className="text-primary">Cashier:</span> amina.uwase@banka.rw</p>
            <p><span className="text-primary">Manager:</span> eric.nkurunziza@banka.rw</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
