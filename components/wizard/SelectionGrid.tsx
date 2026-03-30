"use client";

import { cn } from "@/lib/utils";

interface SelectionGridProps {
  options: { id: string; label: string; badge?: string }[];
  selected?: string | string[];
  onSelect: (label: string) => void;
  columns?: "2" | "2-3" | "2-3-4" | "2-4";
  disabled?: boolean;
}

const columnClasses = {
  "2": "grid-cols-2",
  "2-3": "grid-cols-2 md:grid-cols-3",
  "2-3-4": "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  "2-4": "grid-cols-2 lg:grid-cols-4",
};

export function SelectionGrid({
  options,
  selected,
  onSelect,
  columns = "2-3-4",
  disabled = false,
}: SelectionGridProps) {
  const isSelected = (label: string) => {
    if (Array.isArray(selected)) return selected.includes(label);
    return selected === label;
  };

  return (
    <div className={cn("grid gap-3", columnClasses[columns])}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt.label)}
          disabled={disabled}
          className={cn(
            "h-13 rounded-xl border text-sm font-medium transition-all active:scale-[0.97] touch-manipulation",
            isSelected(opt.label)
              ? "border-teal-500 bg-teal-500/10 text-teal-700 dark:bg-teal-500/15 dark:text-teal-200"
              : "border-border bg-muted/50 text-foreground hover:border-teal-500/40 hover:bg-teal-500/5"
          )}
        >
          {opt.label}
          {opt.badge && (
            <span className="text-muted-foreground ml-1.5 text-[10px]">
              {opt.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
