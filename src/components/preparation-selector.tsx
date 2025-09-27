"use client";

import { Combobox } from "@/components/search-box";
import { PREPARATION_OPTIONS } from "convex/lib/constants";

type PreparationSelectorProps = {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
};

const preparationOptions = PREPARATION_OPTIONS.map((option) => ({
  value: option,
  label: option,
}));

export function PreparationSelector({
  value,
  onValueChange,
  placeholder = "Select preparation...",
  searchPlaceholder = "Search preparations...",
  emptyText = "No preparation found.",
  className,
  disabled = false,
}: PreparationSelectorProps) {
  return (
    <Combobox
      options={preparationOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      emptyText={emptyText}
      className={className}
      disabled={disabled}
      allowClear={true}
      clearText="Clear preparation"
    />
  );
}
