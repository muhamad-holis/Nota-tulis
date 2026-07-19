import { buildReceiptLines } from "@/lib/receiptText";
import type { Nota, Settings } from "@/types";

interface ReceiptPreviewProps {
  nota: Nota;
  settings: Settings;
}

export function ReceiptPreview({ nota, settings }: ReceiptPreviewProps) {
  const lines = buildReceiptLines(nota, settings);

  return (
    <div className="mx-auto w-full max-w-[280px] overflow-x-auto bg-white p-4 text-slate-800">
      {settings.logo && settings.showLogo !== false && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={settings.logo}
          alt="Logo toko"
          className="mx-auto mb-2 h-12 w-12 object-contain"
        />
      )}
      <div className="whitespace-pre font-mono text-[11px] leading-tight">
        {lines.map((l, i) => (
          <div
            key={i}
            className={[
              l.align === "center" ? "text-center" : "text-left",
              l.bold ? "font-bold" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {l.text.length > 0 ? l.text : "\u00A0"}
          </div>
        ))}
      </div>
    </div>
  );
}
