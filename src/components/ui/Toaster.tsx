"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { subscribeToasts, type ToastMessage } from "@/lib/toast";
import { cn } from "@/lib/utils";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const COLORS = {
  success: "bg-emerald-600",
  error: "bg-red-600",
  info: "bg-slate-800",
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white shadow-soft",
                COLORS[toast.type]
              )}
            >
              <Icon size={16} />
              {toast.text}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
