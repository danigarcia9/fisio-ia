"use client";

import { Button } from "@/components/ui/button";

interface CustomInputProps {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  placeholder: string;
  disabled?: boolean;
}

export function CustomInput({
  value,
  onChange,
  onAdd,
  placeholder,
  disabled = false,
}: CustomInputProps) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="bg-card border-border h-12 flex-1 rounded-xl border px-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        onKeyDown={(e) => {
          if (e.key === "Enter" && value.trim()) onAdd();
        }}
      />
      <Button
        variant="outline"
        onClick={onAdd}
        disabled={!value.trim() || disabled}
        className="h-12 shrink-0 px-4"
      >
        +
      </Button>
    </div>
  );
}
