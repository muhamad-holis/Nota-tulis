"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatRupiah, cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductItemProps {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProductItem({ product, onEdit, onDelete }: ProductItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b border-slate-50 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-800">{product.name}</p>
        <p className="text-sm text-slate-400">
          {formatRupiah(product.price)}
          {product.category ? ` · ${product.category}` : ""}
        </p>
      </div>

      <div className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-full p-2 text-slate-400 active:bg-slate-100"
          aria-label="Menu produk"
        >
          <MoreVertical size={18} />
        </button>
        {menuOpen && (
          <div
            className={cn(
              "absolute right-0 top-10 z-10 w-36 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-soft"
            )}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-slate-700 active:bg-slate-50"
            >
              <Pencil size={15} /> Edit
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-600 active:bg-red-50"
            >
              <Trash2 size={15} /> Hapus
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
