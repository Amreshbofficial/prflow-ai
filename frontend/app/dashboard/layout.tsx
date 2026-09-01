"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";

import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, []);

  return (
    <div className="h-full bg-background flex flex-col min-h-screen relative">
      {/* Subtle ambient backdrop — echoes the brand gradient used on the login screen */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.06),transparent_70%)]" />
        <div className="absolute top-1/3 -left-32 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.05),transparent_70%)]" />
      </div>

      <Sidebar
        isMobileOpen={isMobileOpen}
        setMobileOpen={setIsMobileOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main content wrapper */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out relative w-full",
          isCollapsed ? "lg:pl-20" : "lg:pl-[260px]"
        )}
      >
        <TopHeader setMobileOpen={setIsMobileOpen} />

        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full animate-in fade-in zoom-in-[0.98] duration-500 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}