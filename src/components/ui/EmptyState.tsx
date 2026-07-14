import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="rounded-full bg-brand-50 p-4 text-brand-500">
        <Icon size={28} />
      </div>
      <p className="font-medium text-slate-700">{title}</p>
      {description && <p className="max-w-xs text-sm text-slate-400">{description}</p>}
    </div>
  );
}
