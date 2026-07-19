"use client";

import { useEffect, useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";

interface LiveFieldProps {
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

export function LiveField({ value, onCommit, placeholder, multiline, rows }: LiveFieldProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal((prev) => (prev === value ? prev : value));
  }, [value]);

  function handleChange(next: string) {
    setLocal(next);
    onCommit(next);
  }

  if (multiline) {
    return (
      <Textarea
        rows={rows}
        value={local}
        placeholder={placeholder}
        onChange={(e) => handleChange(e.target.value)}
      />
    );
  }

  return (
    <Input
      value={local}
      placeholder={placeholder}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
