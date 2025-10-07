import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ImportRecipeLoading() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-9 w-80 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
        </div>

        {/* Main Card Skeleton */}
        <Card className="p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-14 w-14 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>

          {/* URL Input Skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-3">
                <Skeleton className="h-12 flex-1" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>

        {/* Examples Card Skeleton */}
        <Card className="p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}
