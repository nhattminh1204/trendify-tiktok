"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const toastConfig: Record<
  ToastType,
  { icon: typeof CheckCircle; containerClass: string; iconClass: string; textClass: string }
> = {
  success: {
    icon: CheckCircle,
    containerClass: "bg-green-50 border-green-200",
    iconClass: "text-green-500",
    textClass: "text-green-800",
  },
  error: {
    icon: XCircle,
    containerClass: "bg-red-50 border-red-200",
    iconClass: "text-red-500",
    textClass: "text-red-800",
  },
  info: {
    icon: Info,
    containerClass: "bg-blue-50 border-blue-200",
    iconClass: "text-blue-500",
    textClass: "text-blue-800",
  },
  warning: {
    icon: AlertTriangle,
    containerClass: "bg-amber-50 border-amber-200",
    iconClass: "text-amber-500",
    textClass: "text-amber-800",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-2), { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 w-[360px]">
        {toasts.map((t) => {
          const cfg = toastConfig[t.type];
          const Icon = cfg.icon;
          return (
            <div
              key={t.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 shadow-elevated",
                cfg.containerClass
              )}
            >
              <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", cfg.iconClass)} />
              <p className={cn("flex-1 text-sm", cfg.textClass)}>{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
