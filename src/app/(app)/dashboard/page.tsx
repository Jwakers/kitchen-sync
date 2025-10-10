import { ROUTES } from "@/app/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  ChefHat,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Kitchen Sync",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="space-y-4">
        {/* New Feature Announcement */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-lg border border-primary/20 p-6 shadow-lg">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />

          <div className="relative">
            <Badge className="mb-3 bg-primary/90 hover:bg-primary">
              <Sparkles className="h-3 w-3 mr-1" />
              New Feature
            </Badge>
            <h2 className="text-2xl font-bold text-card-foreground mb-2 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Introducing Households!
            </h2>
            <p className="text-muted-foreground mb-4 max-w-2xl">
              Create households and share your favourite recipes with family and
              friends. Everyone in your household can view your shared recipes,
              but only you can edit them. Perfect for families, flatmates, and
              cooking communities!
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="shadow-md">
                <Link href={ROUTES.HOUSEHOLDS}>
                  <Users className="h-4 w-4 mr-2" />
                  Create Your First Household
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-2">
            Welcome to Kitchen Sync
          </h2>
          <p className="text-muted-foreground">
            Start by adding your first recipe using the + button below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={ROUTES.MY_RECIPES}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ChefHat className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>My Recipes</CardTitle>
                </div>
                <CardDescription>
                  View, edit, and manage all your recipes
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href={ROUTES.HOUSEHOLDS}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg font-semibold">
                NEW
              </div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Households</CardTitle>
                </div>
                <CardDescription>
                  Share recipes with family and friends
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href={ROUTES.SHOPPING_LIST}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>Shopping List</CardTitle>
                </div>
                <CardDescription>
                  Create smart shopping lists from your recipes
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
