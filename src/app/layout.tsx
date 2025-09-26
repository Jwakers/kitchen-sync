import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./providers/convex-client-provider";

const lexendSans = Lexend({
  variable: "--font-lexend-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kitchen Sync - Family Meal Planning Made Simple",
  description:
    "Create recipes, plan weekly meals, and generate smart shopping lists. Take the pain out of family meal planning with Kitchen Sync.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lexendSans.variable} antialiased`}>
        <ClerkProvider>
          <ConvexClientProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
