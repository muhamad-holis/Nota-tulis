"use client";

import { Save, Printer, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ActionButtonsProps {
  onSave: () => void;
  onPrint: () => void;
  onNewNota: () => void;
  saving?: boolean;
  printing?: boolean;
}

export function ActionButtons({ onSave, onPrint, onNewNota, saving, printing }: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button variant="secondary" size="lg" onClick={onSave} disabled={saving} className="flex-col gap-1 text-sm">
        <Save size={18} />
        Simpan
      </Button>
      <Button variant="primary" size="lg" onClick={onPrint} disabled={printing} className="flex-col gap-1 text-sm">
        <Printer size={18} />
        Cetak
      </Button>
      <Button variant="outline" size="lg" onClick={onNewNota} className="flex-col gap-1 text-sm">
        <FilePlus size={18} />
        Nota Baru
      </Button>
    </div>
  );
}
