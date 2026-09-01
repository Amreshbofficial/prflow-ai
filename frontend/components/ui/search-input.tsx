import React, { forwardRef } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("relative rounded-md shadow-sm", className)}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-text-muted" aria-hidden="true" />
        </div>
        <input
          type="text"
          className="block w-full rounded-md border-border bg-surface py-2 pl-10 text-sm text-text-primary focus:border-primary focus:ring-primary sm:leading-6 disabled:bg-surface-secondary disabled:cursor-not-allowed transition-colors"
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
