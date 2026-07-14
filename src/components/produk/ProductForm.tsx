"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { parseRupiahInput } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductFormProps {
  initial?: Product;
  onSubmit: (data: { name: string; price: number; category?: string }) => Promise<void>;
  onCancel: () => void;
}

export function ProductForm({ initial, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [priceText, setPriceText] = useState(initial ? String(initial.price) : "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama barang wajib diisi.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        price: parseRupiahInput(priceText),
        category: category.trim() || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Nama Barang</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kopi Kapal Api" autoFocus />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Harga Jual</label>
        <Input
          value={priceText}
          onChange={(e) => setPriceText(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          placeholder="15000"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">Kategori (opsional)</label>
        <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Minuman" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" className="flex-1" disabled={submitting}>
          Simpan
        </Button>
      </div>
    </form>
  );
}
