"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SIDEBAR_NAVIGATION } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, LogOut, User } from "lucide-react";
import { DropdownMenu, DropdownMenuItem } from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";

interface SidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Sidebar({ isMobileOpen, setMobileOpen, isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: usersApi.getProfile,
    staleTime: 1000 * 60 * 5,
  });

  const displayName = userProfile?.name || "User";
  const displayRole = userProfile?.role || "Consultant";
  const initials = getInitials(displayName);

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  const navContent = (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 shrink-0 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-md shadow-sm bg-gradient-to-br from-indigo-500 to-purple-600 p-1">
            <span className="text-white text-xs font-bold">PR</span>
          </div>
          {!isCollapsed && <span className="text-text-primary">PRFlow AI</span>}
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md hover:bg-surface-secondary text-text-muted transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <nav className="space-y-6 px-3">
          {SIDEBAR_NAVIGATION.map((section) => (
            <div key={section.label}>
              {!isCollapsed && (
                <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
                  {section.label}
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = item.href === '/dashboard' 
                    ? pathname === '/dashboard' 
                    : (pathname === item.href || pathname.startsWith(`${item.href}/`));
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.comingSoon ? "#" : item.href}
                      className={cn(
                        "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-active-bg text-sidebar-active-text"
                          : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
                        item.comingSoon && "opacity-60 cursor-not-allowed",
                        isCollapsed ? "justify-center" : "justify-start"
                      )}
                      title={isCollapsed ? item.name : undefined}
                      onClick={(e) => {
                        if (item.comingSoon) e.preventDefault();
                        else setMobileOpen(false);
                      }}
                    >
                      <item.icon
                        className={cn(
                          "flex-shrink-0",
                          isCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5",
                          isActive ? "text-sidebar-active-text" : "text-text-muted group-hover:text-text-primary"
                        )}
                        aria-hidden="true"
                      />
                      {!isCollapsed && (
                        <span className="flex-1 truncate">{item.name}</span>
                      )}
                      {!isCollapsed && item.comingSoon && (
                        <span className="ml-2 rounded-full bg-surface-secondary px-2 py-0.5 text-xs font-medium text-text-muted">
                          Soon
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="shrink-0 border-t border-sidebar-border p-4">
        <DropdownMenu
          align="left"
          trigger={
            <div className={cn(
              "flex w-full items-center gap-3 rounded-md p-2 hover:bg-surface-secondary transition-colors",
              isCollapsed ? "justify-center" : ""
            )}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white border border-border">
                <span className="text-xs font-bold">{initials}</span>
              </div>
              {!isCollapsed && (
                <div className="flex flex-1 flex-col overflow-hidden text-left">
                  <span className="truncate text-sm font-medium text-text-primary">{displayName}</span>
                  <span className="truncate text-xs text-text-muted capitalize">{displayRole}</span>
                </div>
              )}
            </div>
          }
        >
          <div className="w-full min-w-[200px]">
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <User className="mr-2 h-4 w-4" /> Profile & Settings
            </DropdownMenuItem>
            <div className="h-px bg-border my-1" />
            <DropdownMenuItem onClick={handleLogout} className="text-error hover:bg-error-soft">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </div>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      <div 
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col transition-all duration-300 ease-in-out",
          isCollapsed ? "lg:w-20" : "lg:w-[260px]"
        )}
      >
        {navContent}
      </div>

      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-text-primary/40 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar shadow-elevated transition-transform duration-300 ease-in-out lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {navContent}
      </div>
    </>
  );
}
