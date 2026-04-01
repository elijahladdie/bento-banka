import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientAccounts from "./pages/client/ClientAccounts";
import ClientTransfer from "./pages/client/ClientTransfer";
import ClientProfile from "./pages/client/ClientProfile";
import CashierDashboard from "./pages/cashier/CashierDashboard";
import CashierClients from "./pages/cashier/CashierClients";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerUsers from "./pages/manager/ManagerUsers";
import ManagerAccounts from "./pages/manager/ManagerAccounts";
import ManagerTransactions from "./pages/manager/ManagerTransactions";
import ManagerApprovals from "./pages/manager/ManagerApprovals";
import ManagerStatistics from "./pages/manager/ManagerStatistics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />

    <Route path="/client/dashboard" element={<ProtectedRoute allowedRoles={["client"]}><ClientDashboard /></ProtectedRoute>} />
    <Route path="/client/accounts" element={<ProtectedRoute allowedRoles={["client"]}><ClientAccounts /></ProtectedRoute>} />
    <Route path="/client/transfer" element={<ProtectedRoute allowedRoles={["client"]}><ClientTransfer /></ProtectedRoute>} />
    <Route path="/client/profile" element={<ProtectedRoute allowedRoles={["client"]}><ClientProfile /></ProtectedRoute>} />

    <Route path="/cashier/dashboard" element={<ProtectedRoute allowedRoles={["cashier"]}><CashierDashboard /></ProtectedRoute>} />
    <Route path="/cashier/clients" element={<ProtectedRoute allowedRoles={["cashier"]}><CashierClients /></ProtectedRoute>} />

    <Route path="/manager/dashboard" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerDashboard /></ProtectedRoute>} />
    <Route path="/manager/users" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerUsers /></ProtectedRoute>} />
    <Route path="/manager/accounts" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerAccounts /></ProtectedRoute>} />
    <Route path="/manager/transactions" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerTransactions /></ProtectedRoute>} />
    <Route path="/manager/approvals" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerApprovals /></ProtectedRoute>} />
    <Route path="/manager/statistics" element={<ProtectedRoute allowedRoles={["manager"]}><ManagerStatistics /></ProtectedRoute>} />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
