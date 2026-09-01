import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, secondaryAction, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-12 px-4 border border-dashed border-border rounded-2xl bg-gradient-to-br from-[#4f46e5]/[0.02] to-surface", className)}>
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface mb-5 shadow-[0_8px_16px_-6px_rgba(15,23,42,0.08)] border border-border">
        <Icon className="h-6 w-6 text-text-muted" />
      </div>
      <h3 className="mt-2 text-base font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">{description}</p>
      
      {(action || secondaryAction) && (
        <div className="mt-6 flex items-center justify-center space-x-4">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
