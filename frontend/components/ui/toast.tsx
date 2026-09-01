"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (options: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((options: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, ...options }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000); // auto dismiss after 5s
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    toast: addToast,
    success: (title: string, description?: string) => addToast({ title, description, type: "success" }),
    error: (title: string, description?: string) => addToast({ title, description, type: "error" }),
    info: (title: string, description?: string) => addToast({ title, description, type: "info" }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 sm:p-6 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-success" />,
    error: <AlertTriangle className="h-5 w-5 text-error" />,
    info: <Info className="h-5 w-5 text-info" />,
  };

  const bgs = {
    success: "bg-surface border-success/20",
    error: "bg-surface border-error/20",
    info: "bg-surface border-info/20",
  };

  return (
    <div className={cn(
      "pointer-events-auto flex w-full items-start p-4 shadow-elevated rounded-lg border animate-in slide-in-from-bottom-5 fade-in duration-300",
      bgs[toast.type]
    )}>
      <div className="flex-shrink-0 pt-0.5">
        {icons[toast.type]}
      </div>
      <div className="ml-3 w-0 flex-1">
        <p className="text-sm font-medium text-text-primary">{toast.title}</p>
        {toast.description && (
          <p className="mt-1 text-sm text-text-secondary">{toast.description}</p>
        )}
      </div>
      <div className="ml-4 flex flex-shrink-0">
        <button
          className="inline-flex rounded-md bg-transparent text-text-muted hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onClick={onRemove}
        >
          <span className="sr-only">Close</span>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
