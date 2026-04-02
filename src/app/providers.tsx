"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/hooks/useToast";
import ToastContainer from "@/components/ui/ToastContainer";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { installMockApi } from "@/lib/mock-api";

// Install mock API interceptors once
let mockInstalled = false;
if (!mockInstalled && typeof window !== "undefined") {
  installMockApi();
  mockInstalled = true;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
              <ToastContainer />
              <Toaster />
              <Sonner />
            </ToastProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}
