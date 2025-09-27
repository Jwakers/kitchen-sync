"use client";

import { Combobox } from "@/components/search-box";
import { UNITS } from "convex/lib/constants";

type UnitSelectorProps = {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

const unitCategories = [
  {
    label: "Volume",
    options: UNITS.volume.map((unit) => ({ value: unit, label: unit })),
  },
  {
    label: "Weight",
    options: UNITS.weight.map((unit) => ({ value: unit, label: unit })),
  },
  {
    label: "Count",
    options: UNITS.count.map((unit) => ({ value: unit, label: unit })),
  },
];

export function UnitSelector({
  value,
  onValueChange,
  placeholder = "Select unit",
  disabled = false,
}: UnitSelectorProps) {
  return (
    <Combobox
      categories={unitCategories}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      searchPlaceholder="Search units..."
      emptyText="No unit found."
      disabled={disabled}
      allowClear={true}
      clearText="Clear unit"
    />
  );
}
