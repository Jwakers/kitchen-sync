import { ROUTES } from "@/app/constants";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Kitchen Sync",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
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
          <Link href={ROUTES.MY_RECIPES}>
            <Button>My Recipes</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
