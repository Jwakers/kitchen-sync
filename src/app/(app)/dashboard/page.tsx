import { ROUTES } from "@/app/constants";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChefHat, ShoppingCart } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Kitchen Sync",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
      <div className="space-y-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-2">
            Welcome to Kitchen Sync
          </h2>
          <p className="text-muted-foreground">
            Start by adding your first recipe using the + button below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
