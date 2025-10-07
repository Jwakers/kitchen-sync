import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecipeLoading() {
  return (
    <div
      className="bg-background"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="container mx-auto px-4 py-8">
        <span className="sr-only">Loading recipe…</span>
        {/* Back Button Skeleton */}
        <Skeleton className="h-10 w-48 mb-6" />

        {/* Recipe Image Skeleton */}
        <Skeleton className="aspect-[16/9] rounded-lg mb-6" />

        {/* Recipe Title Skeleton */}
        <Skeleton className="h-6 w-96 mb-4" />

        {/* Recipe Meta Skeleton */}
        <Skeleton className="h-4 w-64 mb-8" />

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
