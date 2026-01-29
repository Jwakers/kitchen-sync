"use client";

import { cn } from "@/lib/utils";

interface FeatureImagePlaceholderProps {
  title: string;
  className?: string;
}

export function FeatureImagePlaceholder({ title, className }: FeatureImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "aspect-[16/10] w-full rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex items-center justify-center",
        className
      )}
      aria-hidden
    >
      <span className="text-sm text-muted-foreground">
        App feature: {title}
      </span>
    </div>
  );
}
