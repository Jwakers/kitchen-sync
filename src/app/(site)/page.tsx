"use client";

import InstallPrompt from "@/components/installation-prompt";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SignUpButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import {
  ArrowRight,
  CheckCircle,
  ChefHat,
  ClipboardList,
  ShoppingCart,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "../constants";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Centered Design */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl opacity-30"></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <div className="space-y-8 py-4">
            {/* Badge */}
            <Badge
              variant="secondary"
              className="w-fit bg-primary/10 text-primary border-primary/20 text-sm px-4 py-2"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Now in Beta - Free to use
            </Badge>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                MEAL PLANNING
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  MADE SIMPLE
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Focus on exciting meals and cooking, not dreading the weekly
                shop. Kitchen Sync makes planning trivial so you can enjoy the
                fun parts.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Authenticated>
                <Button
                  asChild
                  size="lg"
                  className="text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link href={ROUTES.DASHBOARD}>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </Authenticated>
              <Unauthenticated>
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
              </Unauthenticated>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground pt-8">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>No credit card required</span>
              </div>
              <div className="hidden sm:block w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span>Start planning today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-primary/20 rounded-2xl rotate-12 opacity-60"></div>
        <div className="absolute top-40 right-20 w-12 h-12 bg-accent/20 rounded-full opacity-60"></div>
        <div className="absolute bottom-32 left-20 w-20 h-20 bg-primary/15 rounded-3xl -rotate-12 opacity-60"></div>
        <div className="absolute bottom-20 right-10 w-14 h-14 bg-accent/15 rounded-2xl rotate-45 opacity-60"></div>
      </section>

      <div className="container mt-4">
        <InstallPrompt />
      </div>

      {/* Core Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything you need to plan meals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple tools that work together to make meal planning
              effortless
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Recipe Collection</h3>
              <p className="text-sm text-muted-foreground">
                Create, import, and organise your favourite recipes
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                Smart Shopping Lists
              </h3>
              <p className="text-sm text-muted-foreground">
                Generate organised lists from your recipes
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Kitchen Chalkboard</h3>
              <p className="text-sm text-muted-foreground">
                Quick household shopping notes
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Family Sync</h3>
              <p className="text-sm text-muted-foreground">
                Share recipes and lists with your household
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to transform your meal planning
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                1
              </div>
              <h3 className="font-semibold mb-2">Add Your Recipes</h3>
              <p className="text-sm text-muted-foreground">
                Create recipes manually, import from URLs, or paste recipe text
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                2
              </div>
              <h3 className="font-semibold mb-2">Browse & Organise</h3>
              <p className="text-sm text-muted-foreground">
                View your collection, search by category, and find what you need
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                3
              </div>
              <h3 className="font-semibold mb-2">Generate Lists</h3>
              <p className="text-sm text-muted-foreground">
                Create smart shopping lists from your selected recipes
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                4
              </div>
              <h3 className="font-semibold mb-2">Share & Collaborate</h3>
              <p className="text-sm text-muted-foreground">
                Invite household members to share recipes and shopping lists
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left - Problem */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  DREADING THE WEEKLY SHOP?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Meal planning shouldn&apos;t be stressful. Focus on the fun
                  parts of cooking, not the logistics.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    Decision fatigue from endless meal choices
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    Chaotic shopping trips with forgotten ingredients
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    Family members not knowing what&apos;s planned
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    Wasting time on planning instead of cooking
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Solution */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-primary">
                  MAKE PLANNING TRIVIAL
                </h2>
                <p className="text-xl text-muted-foreground">
                  Kitchen Sync makes meal planning fun and interesting, so you
                  can focus on exciting meals and cooking.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-muted-foreground">
                    Build your recipe collection effortlessly
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-muted-foreground">
                    Generate organised shopping lists automatically
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-muted-foreground">
                    Share and collaborate with your household
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-muted-foreground">
                    Spend time cooking, not planning
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Ready to make meal planning simple?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join families who are already enjoying stress-free meal planning
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Authenticated>
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href={ROUTES.DASHBOARD}>
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </Authenticated>
              <Unauthenticated>
                <SignUpButton mode="modal">
                  <Button size="lg" className="text-lg px-8">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
              </Unauthenticated>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              A bit about Kitchen Sync
            </h2>
            <p className="text-lg text-primary-foreground/90 leading-relaxed">
              Kitchen Sync was born from the frustration of endless
              &quot;What&apos;s for dinner?&quot; questions and chaotic grocery
              shopping. We believe meal planning should be simple,
              collaborative, and stress-free. Our platform brings families
              together around food, making it easy to plan, shop, and cook meals
              that everyone will love. We&apos;re a growing platform focused on
              making meal planning fun and interesting, so you can focus on the
              exciting parts of cooking.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
