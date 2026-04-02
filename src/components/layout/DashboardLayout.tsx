"use client";

import { type ReactNode, useState } from "react";
import AmbientBackground from "@/components/ui/AmbientBackground";
import GlassNavbar from "./GlassNavbar";
import GlassSidebar from "./GlassSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

type Role = "client" | "cashier" | "manager";

interface DashboardLayoutProps {
  children: ReactNode;
  role: Role;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <AmbientBackground />
      <GlassNavbar onMenuClick={() => setSidebarOpen((s) => !s)} />
      <GlassSidebar role={role} open={isMobile ? sidebarOpen : true} />
      <main
        style={{
          marginLeft: isMobile ? 0 : 260,
          paddingTop: 64,
          minHeight: "100vh",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>{children}</div>
      </main>
    </>
  );
}
