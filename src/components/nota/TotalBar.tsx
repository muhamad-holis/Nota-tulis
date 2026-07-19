import { formatRupiah } from "@/lib/utils";

export function TotalBar({ total }: { total: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-brand-600 px-5 py-4 text-white shadow-soft">
      <span className="text-sm font-medium text-brand-100">Total</span>
      <span className="text-lg font-medium">{formatRupiah(total)}</span>
    </div>
  );
}
