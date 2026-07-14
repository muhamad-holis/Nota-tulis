"use client";

import { useState } from "react";
import { Plus, Search, Upload, Package } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductItem } from "@/components/produk/ProductItem";
import { ProductForm } from "@/components/produk/ProductForm";
import { ImportDialog } from "@/components/produk/ImportDialog";
import { useProducts, addProduct, updateProduct, deleteProduct } from "@/hooks/useProducts";
import { showToast } from "@/lib/toast";
import type { Product } from "@/types";

export default function ProdukPage() {
  const [search, setSearch] = useState("");
  const products = useProducts(search);
  const [formOpen, setFormOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editing, setEditing] = useState<Product | undefined>(undefined);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setFormOpen(true);
  }

  async function handleSubmit(data: { name: string; price: number; category?: string }) {
    if (editing?.id) {
      await updateProduct(editing.id, data);
      showToast("Produk berhasil diperbarui", "success");
    } else {
      await addProduct(data);
      showToast("Produk berhasil ditambahkan", "success");
    }
    setFormOpen(false);
  }

  async function handleDelete(product: Product) {
    if (!product.id) return;
    await deleteProduct(product.id);
    showToast("Produk dihapus", "info");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50">
      <Header
        title="Produk"
        rightSlot={
          <>
            <button
              onClick={() => setImportOpen(true)}
              className="rounded-full p-2 text-slate-500 active:bg-slate-100"
              aria-label="Import Produk"
            >
              <Upload size={20} />
            </button>
            <button
              onClick={openCreate}
              className="rounded-full p-2 text-slate-500 active:bg-slate-100"
              aria-label="Tambah Produk"
            >
              <Plus size={20} />
            </button>
          </>
        }
      />

      <div className="p-4 pb-2">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="pl-9"
          />
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-4 pb-24">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft">
          {products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Belum ada produk"
              description="Tambahkan produk manual atau import dari spreadsheet."
            />
          ) : (
            products.map((product) => (
              <ProductItem
                key={product.id}
                product={product}
                onEdit={() => openEdit(product)}
                onDelete={() => handleDelete(product)}
              />
            ))
          )}
        </div>
      </main>

      <BottomNav />

      <Dialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit Produk" : "Tambah Produk"}
      >
        <ProductForm initial={editing} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Dialog>

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
