import { ROUTES } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function RecipeNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Recipe Not Found
        </h1>
        <p className="text-muted-foreground mb-6">
          The recipe you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have permission to view it.
        </p>
        <Button size="lg" className="gap-2" asChild>
          <Link href={ROUTES.MY_RECIPES}>
            <ArrowLeft className="h-4 w-4" />
            Back to My Recipes
          </Link>
        </Button>
      </div>
    </div>
  );
}
