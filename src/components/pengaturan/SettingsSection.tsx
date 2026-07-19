import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

interface SettingsSectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SettingsSection({ title, action, children }: SettingsSectionProps) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {action}
      </div>
      {children}
    </Card>
  );
}
