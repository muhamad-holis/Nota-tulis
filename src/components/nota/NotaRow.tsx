"use client";

import { useState } from "react";
import type { KeyboardEvent } from "react";
import { motion, useAnimation } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import type { NotaItem, Product } from "@/types";
import { formatRupiah, parseRupiahInput } from "@/lib/utils";
import { ProductAutocomplete } from "./ProductAutocomplete";

interface NotaRowProps {
  item: NotaItem;
  onUpdate: (patch: Partial<NotaItem>) => void;
  onRemove: () => void;
  onEnterName: () => void;
  onEnterQty: () => void;
  autoFocus?: boolean;
}

export function NotaRow({
  item,
  onUpdate,
  onRemove,
  onEnterName,
  onEnterQty,
  autoFocus,
}: NotaRowProps) {
  const controls = useAnimation();
  const [priceText, setPriceText] = useState(item.price ? String(item.price) : "");
  const total = item.price * item.qty;

  function handleSelectProduct(product: Product) {
    onUpdate({ name: product.name, price: product.price });
    setPriceText(String(product.price));
  }

  function handlePriceChange(text: string) {
    setPriceText(text);
    onUpdate({ price: parseRupiahInput(text) });
  }

  function handlePriceKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      document.getElementById(`qty-input-${item.id}`)?.focus();
    }
  }

  function handleQtyKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnterQty();
    }
  }

  async function handleDragEnd(_: unknown, info: { offset: { x: number } }) {
    if (info.offset.x < -80) {
      onRemove();
    } else {
      controls.start({ x: 0 });
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center bg-red-500 text-white">
        <Trash2 size={18} />
      </div>
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        animate={controls}
        onDragEnd={handleDragEnd}
        className="relative grid grid-cols-[1fr_5.5rem_3.5rem_5.5rem_1.75rem] items-center gap-2 border-b border-slate-50 bg-white px-3 py-2.5"
      >
        <ProductAutocomplete
          id={`name-input-${item.id}`}
          value={item.name}
          onChange={(name) => onUpdate({ name })}
          onSelectProduct={handleSelectProduct}
          onEnter={onEnterName}
          autoFocus={autoFocus}
        />

        <input
          id={`price-input-${item.id}`}
          value={priceText}
          onChange={(e) => handlePriceChange(e.target.value)}
          onKeyDown={handlePriceKeyDown}
          inputMode="numeric"
          placeholder="0"
          className="w-full rounded-lg bg-slate-50 px-2 py-1.5 text-right text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand-100"
        />

        <input
          id={`qty-input-${item.id}`}
          value={item.qty === 0 ? "" : item.qty}
          onChange={(e) => onUpdate({ qty: parseInt(e.target.value.replace(/[^0-9]/g, ""), 10) || 0 })}
          onFocus={(e) => e.target.select()}
          onBlur={() => {
            if (!item.qty) onUpdate({ qty: 1 });
          }}
          onKeyDown={handleQtyKeyDown}
          inputMode="numeric"
          placeholder="1"
          className="w-full rounded-lg bg-slate-50 px-2 py-1.5 text-center text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand-100"
        />

        <span className="truncate text-right text-sm font-medium text-slate-800">
          {formatRupiah(total)}
        </span>

        <button
          onClick={onRemove}
          className="flex items-center justify-center rounded-full p-1 text-slate-300 active:bg-slate-100 active:text-red-500"
          aria-label="Hapus baris"
        >
          <X size={16} />
        </button>
      </motion.div>
    </div>
  );
}
