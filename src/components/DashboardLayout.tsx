import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Landmark, LayoutDashboard, CreditCard, ArrowRightLeft, User, Bell, LogOut, Users, BarChart3, CheckSquare, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navByRole: Record<string, NavItem[]> = {
  client: [
    { label: "Dashboard", path: "/client/dashboard", icon: LayoutDashboard },
    { label: "Accounts", path: "/client/accounts", icon: CreditCard },
    { label: "Transfer", path: "/client/transfer", icon: ArrowRightLeft },
    { label: "Profile", path: "/client/profile", icon: User },
  ],
  cashier: [
    { label: "Dashboard", path: "/cashier/dashboard", icon: LayoutDashboard },
    { label: "Search Client", path: "/cashier/clients", icon: Search },
  ],
  manager: [
    { label: "Dashboard", path: "/manager/dashboard", icon: LayoutDashboard },
    { label: "Users", path: "/manager/users", icon: Users },
    { label: "Accounts", path: "/manager/accounts", icon: CreditCard },
    { label: "Transactions", path: "/manager/transactions", icon: ArrowRightLeft },
    { label: "Approvals", path: "/manager/approvals", icon: CheckSquare },
    { label: "Statistics", path: "/manager/statistics", icon: BarChart3 },
  ],
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items = navByRole[role || "client"] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shrink-0 hidden lg:flex">
        <div className="p-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <Landmark className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold text-foreground">BANKA</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="lg:hidden flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">BANKA</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-4">
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <img src={user?.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20" />
              <div className="hidden sm:block text-sm">
                <p className="font-medium text-foreground">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile nav */}
        <div className="lg:hidden flex overflow-x-auto border-b border-border bg-card px-2">
          {items.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                  active ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
          <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap text-muted-foreground hover:text-destructive">
            <LogOut className="h-3.5 w-3.5" />
            Out
          </button>
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
