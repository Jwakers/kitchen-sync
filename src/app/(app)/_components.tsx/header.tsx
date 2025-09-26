"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { AuthLoading } from "convex/react";
import { Utensils } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";

export function Header() {
  const { theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Utensils className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Kitchen Sync</span>
        </Link>

        {/* Right side - Theme toggle and User button */}
        <div className="flex items-center space-x-4">
          <ModeToggle />

          <div className="size-7 relative">
            <AuthLoading>
              <div
                className="size-full absolute inset-0 bg-primary/50 rounded-full animate-pulse"
                aria-hidden
              />
            </AuthLoading>
            <UserButton
              appearance={{
                baseTheme: theme !== "light" ? dark : undefined,
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
