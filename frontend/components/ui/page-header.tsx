import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold leading-7 text-text-primary sm:truncate sm:tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-text-secondary">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="mt-4 flex sm:mt-0 sm:ml-4 space-x-3">
          {children}
        </div>
      )}
    </div>
  );
}
