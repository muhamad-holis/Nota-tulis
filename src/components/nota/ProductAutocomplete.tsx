"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
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
  const suggestions = useProductSuggestions(focused ? value : "");
  const containerRef = useRef<HTMLDivElement>(null);

  const showDropdown = focused && value.trim() !== "" && suggestions.length > 0;

  useEffect(() => {
    setHighlightIndex(0);
  }, [value, suggestions.length]);

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
    <div ref={containerRef} className="relative w-full">
      <input
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
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-100 bg-white py-1 shadow-soft animate-slide-up">
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
        </div>
      )}
    </div>
  );
}
