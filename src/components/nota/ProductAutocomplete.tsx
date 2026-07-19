"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { useProductSuggestions } from "@/hooks/useProducts";
import { formatRupiah, cn } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectProduct: (product: Product) => void;
  onEnter: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  id?: string;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

export function ProductAutocomplete({
  value,
  onChange,
  onSelectProduct,
  onEnter,
  placeholder = "Nama barang",
  autoFocus,
  id,
}: ProductAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [position, setPosition] = useState<DropdownPosition | null>(null);
  const [mounted, setMounted] = useState(false);
  const suggestions = useProductSuggestions(focused ? value : "");
  const inputRef = useRef<HTMLInputElement>(null);

  const showDropdown = focused && value.trim() !== "" && suggestions.length > 0;

  // Portal ke document.body cuma boleh dipanggil setelah komponen benar-benar mount di
  // browser (bukan saat render server), supaya tidak terjadi mismatch hydration Next.js.
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setHighlightIndex(0);
  }, [value, suggestions.length]);

  // Dropdown ini dirender lewat portal ke document.body (bukan menyatu di dalam baris nota),
  // karena kotak baris & tabel nota sengaja dibuat overflow-hidden (untuk efek geser-hapus
  // dan sudut membulat) yang tanpa sadar ikut memotong dropdown saran ini kalau dirender
  // di dalam struktur DOM biasa. Posisinya dihitung manual mengikuti letak input di layar,
  // dan diperbarui terus selama dropdown terbuka (termasuk saat keyboard HP muncul/scroll).
  useEffect(() => {
    if (!showDropdown) return;

    function updatePosition() {
      const rect = inputRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.visualViewport?.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.visualViewport?.removeEventListener("resize", updatePosition);
    };
  }, [showDropdown]);

  function selectProduct(product: Product) {
    onSelectProduct(product);
    setFocused(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (showDropdown) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const chosen = suggestions[highlightIndex];
        if (chosen) selectProduct(chosen);
        else onEnter();
        return;
      }
      if (e.key === "Escape") {
        setFocused(false);
        return;
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      onEnter();
    }
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        id={id}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        onKeyDown={handleKeyDown}
        className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
      />
      {mounted &&
        showDropdown &&
        position &&
        createPortal(
          <div
            style={{ position: "fixed", top: position.top, left: position.left, width: position.width }}
            className="z-[60] max-h-56 overflow-y-auto rounded-xl border border-slate-100 bg-white py-1 shadow-soft animate-slide-up"
          >
            {suggestions.map((product, index) => (
              <button
                key={product.id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectProduct(product)}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-sm",
                  index === highlightIndex ? "bg-brand-50" : "active:bg-slate-50"
                )}
              >
                <span className="text-slate-700">{product.name}</span>
                <span className="text-slate-400">{formatRupiah(product.price)}</span>
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
