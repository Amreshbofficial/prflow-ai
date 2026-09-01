import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorType = STATUS_COLORS[status] || "default";
  
  const variants = {
    success: "bg-success-soft text-success border-success/20",
    warning: "bg-warning-soft text-warning border-warning/20",
    error: "bg-error-soft text-error border-error/20",
    info: "bg-info-soft text-info border-info/20",
    default: "bg-surface-secondary text-text-secondary border-border",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      variants[colorType],
      className
    )}>
      {status}
    </span>
  );
}
