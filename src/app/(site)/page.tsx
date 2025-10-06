"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SignUpButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  ChefHat,
  Clock,
  Gift,
  Heart,
  Shield,
  ShoppingCart,
  Star,
  Target,
  Users,
  Utensils,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "../constants";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Split Layout */}
      <section className="min-h-screen flex flex-col md:flex-row">
        {/* Left Side - Dark Background */}
        <div className="flex-1 bg-primary text-primary-foreground flex items-center justify-center p-8 lg:p-16">
          <div className="max-w-lg space-y-8">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="w-fit bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
              >
                <Star className="w-3 h-3 mr-1" />
                Trusted by 10,000+ families
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                EASIEST. MEAL PLANNING. EVER.
              </h1>
              <p className="text-xl text-primary-foreground/90 max-w-lg">
                Plan meals, create shopping lists, and keep your family in
                sync—all in one simple platform that actually works.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Authenticated>
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="text-lg px-8"
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
                    variant="secondary"
                    className="text-lg px-8"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
              </Unauthenticated>
            </div>

            <div className="flex items-center space-x-6 text-sm text-primary-foreground/80">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Free forever plan
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image Background */}
        <div className="flex-1 bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center p-8 lg:p-16">
          <div className="relative w-full max-w-md">
            <Card className="shadow-2xl bg-background/95 backdrop-blur">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="font-semibold">This Week&apos;s Plan</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <div
                        key={day}
                        className="font-medium text-muted-foreground"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    "Pasta",
                    "Tacos",
                    "Salad",
                    "Pizza",
                    "Stir Fry",
                    "BBQ",
                    "Soup",
                  ].map((meal, index) => (
                    <div
                      key={index}
                      className="p-2 bg-primary/10 rounded-lg text-center text-sm font-medium"
                    >
                      {meal}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/20 rounded-full opacity-20"></div>
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Recipes</h3>
              <p className="text-sm text-muted-foreground">
                Create & organise your favourite family recipes
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Meal Planning</h3>
              <p className="text-sm text-muted-foreground">
                Plan your weekly meals with ease
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Shopping Lists</h3>
              <p className="text-sm text-muted-foreground">
                Smart, organised shopping lists
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Family Sync</h3>
              <p className="text-sm text-muted-foreground">
                Collaborate with your family
              </p>
            </Card>
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
                  MEAL PLANNING CHAOS?
                </h2>
                <p className="text-xl text-muted-foreground">
                  Stop the endless &quot;What&apos;s for dinner?&quot; questions
                  and last-minute grocery runs.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    Wasting time deciding what to cook
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    Forgetting ingredients at the store
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    Family members not knowing the plan
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-2"></div>
                  <p className="text-muted-foreground">
                    Throwing away unused groceries
                  </p>
                </div>
              </div>
            </div>

            {/* Right - Solution */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-primary">
                  KITCHEN SYNC SOLUTION
                </h2>
                <p className="text-xl text-muted-foreground">
                  Everything organised, everyone informed, zero stress.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-muted-foreground">
                    Weekly meal plans ready in minutes
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-muted-foreground">
                    Smart shopping lists by store section
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-muted-foreground">
                    Family collaboration made simple
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <p className="text-muted-foreground">
                    No more food waste or forgotten items
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8">
              ANOTHER WAY TO JOIN THE FAMILY.
            </h2>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-left">
                <div>
                  <h3 className="text-2xl font-bold mb-4">
                    JOIN THE MILLIONS ALREADY PLANNING.
                  </h3>
                  <p className="text-lg text-muted-foreground mb-4">
                    Our most popular starter plan.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span>Unlimited recipes & meal plans</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span>Smart shopping list generation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span>Family collaboration tools</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span>Recipe import from any website</span>
                  </div>
                </div>

                <div className="pt-4">
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
                        Try for Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </SignUpButton>
                  </Unauthenticated>
                </div>
              </div>

              <div className="relative">
                <Card className="p-8 shadow-2xl">
                  <div className="space-y-6">
                    <div className="text-center">
                      <Utensils className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-bold">KITCHEN SYNC</h3>
                      <p className="text-muted-foreground">Starter Kit</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                        <ChefHat className="h-5 w-5 text-primary" />
                        <span className="text-sm">Recipe Collection</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                        <span className="text-sm">Weekly Planner</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        <span className="text-sm">Smart Lists</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="text-sm">Family Sync</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              WHY JOIN THE FAMILY?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make family meal planning simple and
              enjoyable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                YOU GET TOP-SHELF FEATURES.
              </h3>
              <ul className="text-left space-y-2 text-muted-foreground">
                <li>• Full recipe management system</li>
                <li>• Made with family-first design</li>
                <li>• More tools to find your perfect routine</li>
              </ul>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">
                YOU&apos;RE ALWAYS IN CONTROL.
              </h3>
              <ul className="text-left space-y-2 text-muted-foreground">
                <li>• Skip, edit, or cancel any time</li>
                <li>• No hidden fees</li>
                <li>• 30-Day Money-Back Guarantee</li>
                <li>• Quick product or cancel solutions</li>
                <li>• Cancel with one easy click</li>
              </ul>
            </Card>

            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-4">ALL PERKS, NO FEES.</h3>
              <ul className="text-left space-y-2 text-muted-foreground">
                <li>• Exclusive savings on premium features</li>
                <li>• Little treats on your birthday</li>
                <li>• Free items and more</li>
                <li>• You&apos;re a member after your first plan!</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Icons Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="aspect-square bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm opacity-90">Time Saved</div>
              </div>
            </div>
            <div className="aspect-square bg-muted text-foreground rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm font-medium">Quick Setup</div>
              </div>
            </div>
            <div className="aspect-square bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Heart className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm">Family Love</div>
              </div>
            </div>

            <div className="aspect-square bg-muted text-foreground rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm font-medium">Precision</div>
              </div>
            </div>
            <div className="aspect-square bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Gift className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm">Free Gifts</div>
              </div>
            </div>
            <div className="aspect-square bg-muted text-foreground rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2" />
                <div className="text-sm font-medium">Knowledge</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              TELL US HOW YOU PLAN MEALS.
            </h2>
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
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
              </Unauthenticated>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-primary-foreground/10 rounded-2xl p-8 lg:p-12">
              <blockquote className="text-xl lg:text-2xl italic mb-6">
                &quot;I love the flexibility of this service and the quality of
                the meal planning tools. My family dinners have received a
                serious upgrade.&quot;
              </blockquote>
              <cite className="text-lg font-medium">
                — SARAH, MEMBER SINCE 2023
              </cite>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">A bit about the Family.</h2>
            <p className="text-lg text-primary-foreground/90 leading-relaxed">
              Kitchen Sync was born from the frustration of endless
              &quot;What&apos;s for dinner?&quot; questions and chaotic grocery
              shopping. We believe meal planning should be simple,
              collaborative, and stress-free. Our platform brings families
              together around food, making it easy to plan, shop, and cook meals
              that everyone will love. Join thousands of families who have
              transformed their kitchen routines with Kitchen Sync.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
