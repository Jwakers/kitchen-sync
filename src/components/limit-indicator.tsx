import { cn } from "@/lib/utils";

interface LimitIndicatorProps {
  current: number;
  max: number;
  label: string;
  className?: string;
}

export function LimitIndicator({
  current,
  max,
  label,
  className,
}: LimitIndicatorProps) {
  const percentage = (current / max) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= max;

  return (
    <div className={cn("text-sm", className)}>
      <span
        className={cn(
          isAtLimit
            ? "text-destructive"
            : isNearLimit
              ? "text-orange-600"
              : "text-muted-foreground"
        )}
      >
        {current}/{max} {label}
      </span>
      {isNearLimit && !isAtLimit && (
        <span className="ml-2 text-xs text-orange-600">(nearing limit)</span>
      )}
      {isAtLimit && (
        <span className="ml-2 text-xs text-destructive">(limit reached)</span>
      )}
    </div>
  );
}
