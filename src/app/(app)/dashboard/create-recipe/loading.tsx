import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CreateRecipeLoading() {
  return (
    <div className="flex flex-col bg-background w-full max-w-4xl mx-auto">
      {/* Header skeleton */}
      <header className="shrink-0 border-b bg-background px-4 py-3">
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </header>

      {/* Form content skeleton */}
      <div className="flex-1 p-4 overflow-hidden">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-20 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Step progress skeleton */}
      <div className="sticky bottom-0 border-t bg-background">
        <div className="px-4 py-3 border-t">
          <div className="flex items-center justify-between text-sm mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-2 flex-1 rounded" />
            <Skeleton className="h-2 flex-1 rounded" />
            <Skeleton className="h-2 flex-1 rounded" />
            <Skeleton className="h-2 flex-1 rounded" />
          </div>
        </div>
        <div className="p-4 border-t flex gap-2">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 flex-1 rounded-md" />
        </div>
      </div>
    </div>
  );
}
