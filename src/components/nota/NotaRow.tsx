"use client";

import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { motion, useAnimation } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import type { NotaItem, Product } from "@/types";
import { parseRupiahInput } from "@/lib/utils";
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
  const computedTotal = item.price * item.qty;
  const effectiveTotal = item.totalOverride ?? computedTotal;
  const [totalText, setTotalText] = useState(effectiveTotal ? String(effectiveTotal) : "");

  useEffect(() => {
    setTotalText(effectiveTotal ? String(effectiveTotal) : "");
  }, [effectiveTotal]);

  function handleSelectProduct(product: Product) {
    onUpdate({ name: product.name, price: product.price, totalOverride: undefined });
    setPriceText(String(product.price));
  }

  function handlePriceChange(text: string) {
    setPriceText(text);
    onUpdate({ price: parseRupiahInput(text), totalOverride: undefined });
  }

  function handleQtyChange(text: string) {
    const qty = parseInt(text.replace(/[^0-9]/g, ""), 10) || 0;
    onUpdate({ qty, totalOverride: undefined });
  }

  function handleTotalChange(text: string) {
    setTotalText(text);
    onUpdate({ totalOverride: parseRupiahInput(text) });
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

  function handleTotalKeyDown(e: KeyboardEvent<HTMLInputElement>) {
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
        className="relative grid grid-cols-[1fr_4.5rem_2.25rem_5rem_1.75rem] items-center gap-2 border-b border-slate-50 bg-white px-3 py-2.5"
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
          className="w-full rounded-lg bg-slate-50 px-1.5 py-1.5 text-right text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand-100"
        />

        <input
          id={`qty-input-${item.id}`}
          value={item.qty === 0 ? "" : item.qty}
          onChange={(e) => handleQtyChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          onBlur={() => {
            if (!item.qty) onUpdate({ qty: 1 });
          }}
          onKeyDown={handleQtyKeyDown}
          inputMode="numeric"
          placeholder="1"
          className="w-full rounded-lg bg-slate-50 px-1 py-1.5 text-center text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand-100"
        />

        <input
          id={`total-input-${item.id}`}
          value={totalText}
          onChange={(e) => handleTotalChange(e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={handleTotalKeyDown}
          inputMode="numeric"
          placeholder="0"
          title="Otomatis dari Harga x Qty, atau ketik manual untuk mengoverride"
          className={`w-full rounded-lg px-1.5 py-1.5 text-right text-sm font-medium outline-none focus:ring-2 focus:ring-brand-100 ${
            item.totalOverride !== undefined
              ? "bg-amber-50 text-amber-700"
              : "bg-slate-50 text-slate-800"
          }`}
        />

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
