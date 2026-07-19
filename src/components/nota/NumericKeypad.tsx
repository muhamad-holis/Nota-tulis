"use client";

import { Check, Delete } from "lucide-react";
import { motion } from "framer-motion";

interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onConfirm: () => void;
  allowDecimal?: boolean;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"];

export function NumericKeypad({
  onDigit,
  onBackspace,
  onConfirm,
  allowDecimal = false,
}: NumericKeypadProps) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-100 bg-white p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-4px_16px_rgba(15,23,42,0.08)]"
    >
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        {KEYS.map((key) => {
          if (key === ".") {
            return (
              <button
                key={key}
                disabled={!allowDecimal}
                onClick={() => onDigit(".")}
                className="h-12 rounded-xl bg-slate-50 text-lg font-medium text-slate-700 active:bg-slate-100 disabled:opacity-30"
              >
                ,
              </button>
            );
          }
          if (key === "back") {
            return (
              <button
                key={key}
                onClick={onBackspace}
                className="flex h-12 items-center justify-center rounded-xl bg-slate-50 text-slate-700 active:bg-slate-100"
              >
                <Delete size={20} />
              </button>
            );
          }
          return (
            <button
              key={key}
              onClick={() => onDigit(key)}
              className="h-12 rounded-xl bg-slate-50 text-lg font-medium text-slate-700 active:bg-slate-100"
            >
              {key}
            </button>
          );
        })}
      </div>
      <button
        onClick={onConfirm}
        className="mx-auto mt-2 flex h-12 w-full max-w-md items-center justify-center gap-2 rounded-xl bg-brand-600 text-white active:bg-brand-700"
      >
        <Check size={20} />
        <span className="font-medium">Selesai</span>
      </button>
    </motion.div>
  );
}
