"use client";

import { ROUTES } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { Ellipsis, Home, Plus, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AddRecipeDrawer } from "./add-recipe-drawer";

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex items-center justify-around px-4 py-2">
          {/* Home */}
          <Link href={ROUTES.DASHBOARD}>
            <Button variant="ghost" size="icon" className="h-12 w-12">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Button>
          </Link>

          {/* Shopping List */}
          <Link href={ROUTES.SHOPPING_LIST}>
            <Button variant="ghost" size="icon" className="h-12 w-12">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Shopping List</span>
            </Button>
          </Link>

          {/* Add Recipe - Primary action */}
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setDrawerOpen(true)}
            aria-label="Add Recipe"
          >
            <Plus className="h-6 w-6" />
          </Button>

          {/* Profile */}
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12"
            aria-label="Profile"
            disabled
          >
            <User className="h-5 w-5" />
          </Button>

          {/* More menu - could be expanded later */}
          <Button variant="ghost" size="icon" className="h-12 w-12" disabled>
            <Ellipsis />
            <span className="sr-only">More</span>
          </Button>
        </div>
      </nav>

      <AddRecipeDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
