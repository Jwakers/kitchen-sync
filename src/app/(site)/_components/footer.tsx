import { Utensils } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Utensils className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Kitchen Sync</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Making family meal planning simple, organized, and stress-free.
              Create recipes, generate smart shopping lists, and collaborate
              with your household.
            </p>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard/support"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Help & Support
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/support/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/support/faq"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/support/how-to-use"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  How to Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Kitchen Sync. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Making meal planning fun and simple
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
