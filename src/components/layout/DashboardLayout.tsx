"use client";

import { type ReactNode, useState } from "react";
import AmbientBackground from "@/components/ui/AmbientBackground";
import GlassNavbar from "./GlassNavbar";
import GlassSidebar from "./GlassSidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

type Role = "client" | "cashier" | "manager";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role } = useAuth();
  const resolvedRole: Role = role === "cashier" || role === "manager" ? role : "client";

  return (
    <>
      <AmbientBackground />
      <GlassNavbar onMenuClick={() => setSidebarOpen((s) => !s)} />
      <GlassSidebar role={resolvedRole} open={isMobile ? sidebarOpen : true} />
      {/* <main
        style={{
          marginLeft: isMobile ? 0 : 260,
          paddingTop: 64,
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>{children}</div>
      </main> */}
      <main
  className={`relative z-10 flex flex-col min-h-screen ${
    isMobile ? "ml-0" : "ml-[260px]"
  } pt-16`}
>
  <div className="flex flex-col flex-1 w-full max-w-[1400px] mx-auto p-6">
    {children}
  </div>
</main>
    </>
  );
}
