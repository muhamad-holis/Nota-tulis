import { formatDateTime, formatRupiah } from "@/lib/utils";
import type { Nota, Settings } from "@/types";

interface ReceiptPreviewProps {
  nota: Nota;
  settings: Settings;
}

export function ReceiptPreview({ nota, settings }: ReceiptPreviewProps) {
  return (
    <div className="mx-auto w-full max-w-[280px] bg-white p-4 font-mono text-[11px] leading-relaxed text-slate-800">
      <div className="text-center">
        {settings.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={settings.logo} alt="Logo toko" className="mx-auto mb-2 h-12 w-12 object-contain" />
        )}
        <p className="text-sm font-bold">{settings.storeName}</p>
        {settings.address && <p>{settings.address}</p>}
        {settings.phone && <p>{settings.phone}</p>}
      </div>

      <div className="my-2 border-t border-dashed border-slate-400" />

      {settings.headerText && (
        <>
          <p className="whitespace-pre-line text-center">{settings.headerText}</p>
          <div className="my-2 border-t border-dashed border-slate-400" />
        </>
      )}

      <p>NOTA BELANJA</p>
      <p>{formatDateTime(nota.date)}</p>
      <p>No. {nota.number}</p>

      <div className="my-2 border-t border-dashed border-slate-400" />

      {nota.items.map((item) => (
        <div key={item.id} className="mb-1">
          <p>{item.name}</p>
          <div className="flex justify-between">
            <span>
              {formatRupiah(item.price)} x{item.qty}
            </span>
            <span>{formatRupiah(item.totalOverride ?? item.price * item.qty)}</span>
          </div>
        </div>
      ))}

      <div className="my-2 border-t border-dashed border-slate-400" />

      <div className="flex justify-between text-sm font-bold">
        <span>TOTAL</span>
        <span>{formatRupiah(nota.total)}</span>
      </div>

      <div className="my-2 border-t border-dashed border-slate-400" />

      {settings.footerText && (
        <p className="whitespace-pre-line text-center">{settings.footerText}</p>
      )}
    </div>
  );
}
