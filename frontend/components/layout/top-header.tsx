"use client";

import React from "react";
import { HelpCircle, Menu } from "lucide-react";
import { GlobalSearch } from "./global-search";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DropdownMenu, DropdownMenuItem } from "../ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import { LogOut, User } from "lucide-react";
import { usersApi } from "@/lib/api";

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface TopHeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export function TopHeader({ setMobileOpen }: TopHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: usersApi.getProfile,
    staleTime: 1000 * 60 * 5,
  });

  const initials = getInitials(userProfile?.name);

  const getBreadcrumb = () => {
    if (pathname === "/dashboard") return "Dashboard";
    const pathParts = pathname.split("/").filter(Boolean);
    if (pathParts.length > 1) {
      const page = pathParts[pathParts.length - 1];
      return page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, " ");
    }
    return "Dashboard";
  };

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-surface px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-text-muted hover:text-text-primary lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
        <div className="hidden lg:block">
          <span className="text-sm font-medium text-text-secondary">{getBreadcrumb()}</span>
        </div>
        
        <div className="flex flex-1 justify-center lg:justify-start lg:pl-8">
          <div className="w-full max-w-lg">
            <GlobalSearch />
          </div>
        </div>

        <div className="flex items-center gap-x-3 sm:gap-x-5">
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          <div>
            <DropdownMenu
              align="right"
              trigger={
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 cursor-pointer">
                  <span className="text-xs font-bold text-white">{initials}</span>
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
      </div>
    </header>
  );
}
