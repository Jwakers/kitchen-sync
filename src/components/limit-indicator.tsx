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
  const maximum = max === -1 ? Infinity : max;
  const isAtLimit = current >= maximum;

  return (
    <div className={cn("text-xs space-x-1", className)}>
      <span className="text-muted-foreground">
        {current}/{max === -1 ? "unlimited" : max} {label}
      </span>
      {isAtLimit && <span>(limit reached)</span>}
    </div>
  );
}
