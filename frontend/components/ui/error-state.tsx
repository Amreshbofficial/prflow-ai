import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = "Unable to load this page", 
  description = "Something went wrong while loading your data.", 
  onRetry,
  className 
}: ErrorStateProps) {
  return (
    <div className={cn("text-center py-12 px-4 border border-border rounded-lg bg-error-soft/30", className)}>
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-error-soft mb-4">
        <AlertTriangle className="h-6 w-6 text-error" />
      </div>
      <h3 className="mt-2 text-sm font-medium text-text-primary">{title}</h3>
      <p className="mt-1 text-sm text-text-secondary">{description}</p>
      
      {onRetry && (
        <div className="mt-6">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-hover active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
