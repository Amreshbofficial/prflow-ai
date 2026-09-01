import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-secondary/50", className)}
      {...props}
    />
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full">
      <div className="border-b border-border py-3">
        <Skeleton className="h-6 w-full max-w-[200px]" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 py-4 border-b border-border">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-3 w-[200px]" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] rounded-2xl border border-border p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <Skeleton className="h-24 w-full" />
      <div className="bg-surface shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] rounded-2xl border border-border p-6 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  );
}
