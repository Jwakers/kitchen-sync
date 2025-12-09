"use client";

import { ROUTES } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { Clipboard, Home, Plus, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AddRecipeDrawer } from "./add-recipe-drawer";

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.setProperty(
      "--nav-height",
      `${navRef.current?.clientHeight}px`
    );
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        className="sticky bottom-0 safe-area-inset-bottom left-0 right-0 z-50 bg-background border-t border-border"
      >
        <div className="flex items-center justify-around px-4 py-2">
          {/* Home */}
          <Link href={ROUTES.DASHBOARD}>
            <Button
              variant="ghost"
              className="h-auto w-auto flex flex-col items-center gap-1 px-3 py-2"
            >
              <Home className="h-5 w-5" />
              <span className="text-[0.625rem] sm:text-xs">Home</span>
            </Button>
          </Link>

          {/* Shopping List */}
          <Link href={ROUTES.SHOPPING_LIST}>
            <Button
              variant="ghost"
              className="h-auto w-auto flex flex-col items-center gap-1 px-3 py-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="text-[0.625rem] sm:text-xs">
                Shopping<span className="hidden sm:inline"> list</span>
              </span>
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

          {/* Chalkboard */}
          <Link href={ROUTES.CHALKBOARD}>
            <Button
              variant="ghost"
              className="h-auto w-auto flex flex-col items-center gap-1 px-3 py-2"
            >
              <Clipboard className="h-5 w-5" />
              <span className="text-[0.625rem] sm:text-xs">Chalkboard</span>
            </Button>
          </Link>

          {/* Households */}
          <Link href={ROUTES.HOUSEHOLDS}>
            <Button
              variant="ghost"
              className="h-auto w-auto flex flex-col items-center gap-1 px-3 py-2"
            >
              <Users className="h-5 w-5" />
              <span className="text-[0.625rem] sm:text-xs">Households</span>
            </Button>
          </Link>
        </div>
      </nav>

      <AddRecipeDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  );
}
