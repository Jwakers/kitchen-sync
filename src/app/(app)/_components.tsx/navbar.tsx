"use client";

import { Button } from "@/components/ui/button";
import { Home, Plus, Search, User } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex items-center justify-around px-4 py-2">
        {/* Home */}
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-12 w-12">
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Button>
        </Link>

        {/* Search */}
        <Button variant="ghost" size="icon" className="h-12 w-12">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Add Recipe - Primary action */}
        <Link href="/new-recipe">
          <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add Recipe</span>
          </Button>
        </Link>

        {/* Profile */}
        <Button variant="ghost" size="icon" className="h-12 w-12">
          <User className="h-5 w-5" />
          <span className="sr-only">Profile</span>
        </Button>

        {/* More menu - could be expanded later */}
        <Button variant="ghost" size="icon" className="h-12 w-12">
          <div className="flex flex-col gap-0.5">
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
            <div className="w-1 h-1 bg-current rounded-full"></div>
          </div>
          <span className="sr-only">More</span>
        </Button>
      </div>
    </nav>
  );
}
