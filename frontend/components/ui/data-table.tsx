import React from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TableSkeleton } from "./loading-skeleton";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  // Pagination
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  // Selection
  selectedIds?: Set<string | number>;
  onSelect?: (id: string | number) => void;
  onSelectAll?: (selectAll: boolean) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading,
  emptyState,
  onRowClick,
  page = 1,
  totalPages = 1,
  onPageChange,
  selectedIds,
  onSelect,
  onSelectAll,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] p-4">
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const isAllSelected = data.length > 0 && selectedIds?.size === data.length;

  return (
    <div className="bg-surface rounded-2xl border border-border shadow-[0_12px_36px_-14px_rgba(15,23,42,0.10)] overflow-hidden flex flex-col transition-shadow hover:shadow-[0_16px_44px_-14px_rgba(15,23,42,0.14)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-surface-secondary/60">
            <tr>
              {onSelectAll && (
                <th scope="col" className="relative px-6 py-3.5 w-12 sm:w-16 sm:px-8">
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-border-strong text-primary focus:ring-primary sm:left-6 accent-[#4f46e5]"
                    checked={isAllSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={cn(
                    "px-6 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {data.map((row) => {
              const id = keyExtractor(row);
              const isSelected = selectedIds?.has(id);

              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "hover:bg-surface-secondary/40 transition-colors",
                    onRowClick && "cursor-pointer",
                    isSelected && "bg-[#4f46e5]/[0.04]"
                  )}
                >
                  {onSelect && (
                    <td className="relative px-6 py-4 w-12 sm:w-16 sm:px-8" onClick={(e) => e.stopPropagation()}>
                      {isSelected && (
                        <div className="absolute inset-y-0 left-0 w-0.5 bg-primary rounded-r" />
                      )}
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-border-strong text-primary focus:ring-primary sm:left-6 accent-[#4f46e5]"
                        checked={isSelected}
                        onChange={() => onSelect(id)}
                      />
                    </td>
                  )}
                  {columns.map((col, i) => (
                    <td
                      key={i}
                      className={cn(
                        "px-6 py-4 whitespace-nowrap text-sm text-text-primary",
                        col.className
                      )}
                    >
                      {typeof col.accessor === "function"
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border bg-surface px-4 py-3 sm:px-6 mt-auto">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <p className="text-sm text-text-secondary">
              Page <span className="font-semibold text-text-primary">{page}</span> of{" "}
              <span className="font-semibold text-text-primary">{totalPages}</span>
            </p>
            <nav className="isolate inline-flex gap-1" aria-label="Pagination">
              <button
                onClick={() => onPageChange?.(page - 1)}
                disabled={page === 1}
                className="relative inline-flex items-center rounded-lg px-2 py-1.5 text-text-muted border border-border hover:bg-surface-secondary focus:z-20 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => onPageChange?.(page + 1)}
                disabled={page === totalPages}
                className="relative inline-flex items-center rounded-lg px-2 py-1.5 text-text-muted border border-border hover:bg-surface-secondary focus:z-20 focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
