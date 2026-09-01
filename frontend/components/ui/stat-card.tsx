import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon: Icon, trend, isLoading, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-surface rounded-2xl border border-border p-5 shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-text-secondary truncate">{title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4f46e5]/[0.12] to-[#6366f1]/[0.06] border border-[#4f46e5]/10">
          <Icon className="h-4.5 w-4.5 text-primary" style={{ height: 18, width: 18 }} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-2xl font-bold text-text-primary">
          {isLoading ? (
            <div className="h-8 w-16 bg-surface-secondary animate-pulse rounded mt-1" />
          ) : (
            value
          )}
        </div>
        {trend && !isLoading && (
          <div className={cn(
            "flex items-baseline text-xs font-semibold",
            trend.isPositive !== false ? "text-success" : "text-error"
          )}>
            {trend.isPositive !== false ? "↑" : "↓"} {trend.value}%
            <span className="ml-1 font-normal text-text-muted">
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
