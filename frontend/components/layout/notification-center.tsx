"use client";

import React, { useState } from "react";
import { Bell, CheckCircle } from "lucide-react";
import { DropdownMenu } from "../ui/dropdown-menu";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/api";

export function NotificationCenter() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: analyticsApi.getDashboardStats,
  });

  const notifications = stats?.recent_activities || [];
  const unreadCount = notifications.length > 0 ? notifications.length : 0;

  const markAllRead = () => {
    // In a real app, you would call an API to mark these as read
  };

  return (
    <DropdownMenu
      trigger={
        <button className="relative rounded-full p-2 text-text-muted hover:bg-surface-secondary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring">
          <span className="sr-only">View notifications</span>
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-error ring-2 ring-surface" />
          )}
        </button>
      }
    >
      <div className="w-80 sm:w-96">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
          {unreadCount > 0 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                markAllRead();
              }}
              className="text-xs font-medium text-primary hover:text-primary-hover"
            >
              Mark all read
            </button>
          )}
        </div>
        
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-text-muted">
              No notifications yet.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((notification: any) => (
                <li key={notification.id} className="px-4 py-3 hover:bg-surface-secondary/50 transition-colors bg-primary-soft/20">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary capitalize truncate">
                        {notification.type?.replace(/_/g, ' ')}
                      </p>
                      <p className="mt-0.5 text-sm text-text-muted truncate">
                        {notification.description}
                      </p>
                      <p className="mt-0.5 text-xs text-text-disabled">
                        {notification.created_at ? new Date(notification.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="border-t border-border p-2">
          <Link href="/dashboard/analytics" className="block w-full rounded-md px-4 py-2 text-center text-sm font-medium text-text-secondary hover:bg-surface-secondary transition-colors">
            View Activity History
          </Link>
        </div>
      </div>
    </DropdownMenu>
  );
}
