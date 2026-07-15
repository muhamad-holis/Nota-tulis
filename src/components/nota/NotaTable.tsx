"use client";

import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { NotaRow } from "./NotaRow";
import type { NotaItem } from "@/types";

interface NotaTableProps {
  items: NotaItem[];
  onUpdateItem: (id: string, patch: Partial<NotaItem>) => void;
  onRemoveItem: (id: string) => void;
  onAddRow: () => void;
  onEnterName: (id: string) => void;
  onEnterQty: (id: string, isLast: boolean) => void;
}

export function NotaTable({
  items,
  onUpdateItem,
  onRemoveItem,
  onAddRow,
  onEnterName,
  onEnterQty,
}: NotaTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
      <div className="grid grid-cols-[1fr_4.5rem_2.25rem_5rem_1.75rem] gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
        <span>Nama Barang</span>
        <span className="text-right">Harga</span>
        <span className="text-center">Qty</span>
        <span className="text-right">Total</span>
        <span />
      </div>

      <AnimatePresence initial={false}>
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            <NotaRow
              item={item}
              onUpdate={(patch) => onUpdateItem(item.id, patch)}
              onRemove={() => onRemoveItem(item.id)}
              onEnterName={() => onEnterName(item.id)}
              onEnterQty={() => onEnterQty(item.id, index === items.length - 1)}
              autoFocus={index === 0}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={onAddRow}
        className="flex w-full items-center justify-center gap-1.5 px-3 py-3 text-sm font-medium text-brand-600 active:bg-brand-50"
      >
        <Plus size={16} />
        Tambah Baris
      </button>
    </div>
  );
}
