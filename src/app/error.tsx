"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <h2 className="text-lg font-semibold text-slate-800">Terjadi kesalahan</h2>
      <p className="max-w-sm text-sm text-slate-500 break-words">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white"
      >
        Coba lagi
      </button>
    </div>
  );
}
