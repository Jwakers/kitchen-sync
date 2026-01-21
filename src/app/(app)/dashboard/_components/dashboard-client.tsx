"use client";

import { getCannyBoardUrl } from "@/app/(app)/_components.tsx/canny-identify";
import { ROUTES } from "@/app/constants";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";
import { api } from "convex/_generated/api";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  ArrowRight,
  ChefHat,
  Clipboard,
  Clock,
  Globe,
  LucideIcon,
  MessageSquare,
  Plus,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type RecentActivity = FunctionReturnType<typeof api.recipes.getRecentActivity>;
const baseCannyBoardUrl = process.env.NEXT_PUBLIC_CANNY_BOARD_URL;

function HeroSection() {
  const { user } = useUser();
  const firstName = user?.firstName || "there";

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-xl border border-primary/20 p-6 mb-6">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

      <div className="relative">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Welcome back, {firstName}!
        </h1>
        <p className="text-muted-foreground mb-4">
          Ready to plan your next meal? Check out your existing recipes or build
          your shopping list.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="shadow-md">
            <Link href={ROUTES.MY_RECIPES}>View My Recipes</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={ROUTES.SHOPPING_LIST}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Shopping List
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function ActivityCard({
  recipe,
}: {
  recipe: FunctionReturnType<
    typeof api.recipes.getRecentActivity
  >["recent"][number];
}) {
  const totalTime = (recipe.prepTime ?? 0) + (recipe.cookTime ?? 0);

  return (
    <Link
      href={`${ROUTES.RECIPE}/${recipe._id}`}
      aria-label={`Edit ${recipe.title || "recipe"}`}
      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {recipe.image ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">
          {recipe.title || "Untitled Recipe"}
        </h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{totalTime} min</span>
        </div>
      </div>
      <div className="flex-shrink-0">
        <ArrowRight className="size-4" />
      </div>
    </Link>
  );
}

function RecentActivitySection({ data }: { data: RecentActivity | undefined }) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="w-8 h-8 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasActivity = data.recent.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Your latest recipes</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasActivity ? (
          <div className="text-center py-8">
            <ChefHat className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              No recent activity - start by creating a recipe with the
              &quot;+&quot; button below
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Recent Recipes */}
            {data.recent.map((recipe) => (
              <ActivityCard key={recipe._id} recipe={recipe} />
            ))}

            {data.recent.length > 0 && (
              <div className="pt-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={ROUTES.MY_RECIPES}>View All Recipes</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  className = "",
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Card
        className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer ${className}`}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            </div>
          </div>
          {children}
        </CardHeader>
      </Card>
    </Link>
  );
}

function HouseholdsSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-primary/8 to-background rounded-xl border border-primary/25 p-6 mb-6">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Households</h2>
            <p className="text-sm text-muted-foreground">
              Collaborate with family & friends
            </p>
          </div>
        </div>

        <p className="text-muted-foreground mb-4 max-w-2xl">
          Create households to share your favourite recipes with family and
          friends. Everyone can view shared recipes, manage household items
          together via the shared kitchen chalkboard, and collaborate on
          shopping lists. Perfect for families, flatmates, and cooking
          communities!
        </p>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="shadow-md">
            <Link href={ROUTES.HOUSEHOLDS}>
              <Users className="h-4 w-4 mr-2" />
              Manage Households
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={ROUTES.HOUSEHOLDS}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Household
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function FeedbackSection() {
  const pathname = usePathname();
  const cannyBoardUrl = baseCannyBoardUrl ? getCannyBoardUrl(pathname) : null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-accent/20 via-accent/10 to-background rounded-xl border border-accent/30 p-6 mb-6">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-accent/20 blur-2xl" />

      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-accent/20 rounded-lg">
            <MessageSquare className="h-6 w-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Help Us Improve
            </h2>
            <p className="text-sm text-muted-foreground">
              Share your feedback and suggestions
            </p>
          </div>
        </div>

        <p className="text-muted-foreground mb-4 max-w-2xl">
          Your feedback helps us make Kitchen Sync better for everyone. Whether
          you have suggestions for new features, found a bug, or just want to
          share your experience, we&apos;d love to hear from you!
        </p>

        {cannyBoardUrl ? (
          <Button asChild className="shadow-md">
            <a
              data-canny-link
              href={cannyBoardUrl}
              rel="noreferrer"
              target="_blank"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Share Feedback
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function BentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Chalkboard - Large */}
      <FeatureCard
        title="Kitchen Chalkboard"
        description="Quick notes for your kitchen, for yourself or your household"
        icon={Clipboard}
        href={ROUTES.CHALKBOARD}
        className="md:col-span-1 h-full"
      />

      {/* My Recipes - Medium */}
      <FeatureCard
        title="My Recipes"
        description="View, manage and create recipes"
        icon={ChefHat}
        href={ROUTES.MY_RECIPES}
        className="md:col-span-1 h-full"
      />

      {/* Shopping List - Medium */}
      <FeatureCard
        title="Shopping List"
        description="Create smart shopping lists from saved recipes and the kitchen chalkboard"
        icon={ShoppingCart}
        href={ROUTES.SHOPPING_LIST}
        className="md:col-span-1 h-full"
      />

      {/* Import Recipe - Small */}
      <FeatureCard
        title="Import Recipe"
        description="Save recipes from websites or copy and paste text"
        icon={Globe}
        href={ROUTES.IMPORT_RECIPE}
        className="md:col-span-1 h-full"
      />
    </div>
  );
}

export default function DashboardClient() {
  const recentActivity = useQuery(api.recipes.getRecentActivity);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <HeroSection />
      <HouseholdsSection />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <RecentActivitySection data={recentActivity} />
        </div>

        {/* Feature Grid */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <BentoGrid />
        </div>

        <div className="order-3 lg:order-3 col-span-full">
          <FeedbackSection />
        </div>
      </div>
    </div>
  );
}
