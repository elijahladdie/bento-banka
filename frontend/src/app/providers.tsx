"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/hooks/useToast";
import ToastContainer from "@/components/ui/ToastContainer";
import { NotificationProvider } from "@/context/NotificationContext";
import { useState } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <NotificationProvider>
              <ToastProvider>
                {children}
                <ToastContainer />
              </ToastProvider>
            </NotificationProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}
