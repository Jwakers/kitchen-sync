"use client";

import { ROUTES } from "@/app/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  HelpCircle,
  LifeBuoy,
  Mail,
  MessageSquare,
  Users,
  Utensils,
} from "lucide-react";
import Link from "next/link";

import { faqSections } from "./faq/page";

const featuredFAQs = faqSections.flatMap((section) => section.questions[0]);

export default function SupportPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <LifeBuoy className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Help & Support</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Find answers to common questions, learn how to use Kitchen Sync, or
          get in touch with our support team.
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">FAQ</CardTitle>
            </div>
            <CardDescription>
              Find answers to frequently asked questions about features,
              troubleshooting, and account management.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={ROUTES.SUPPORT_FAQ}>Browse FAQ</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-lg">How to Use</CardTitle>
            </div>
            <CardDescription>
              Step-by-step guides to help you get started and master all the
              features of Kitchen Sync.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={ROUTES.SUPPORT_HOW_TO}>Learn How</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">Contact Us</CardTitle>
            </div>
            <CardDescription>
              Can&apos;t find what you&apos;re looking for? Send us a message
              and we&apos;ll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={ROUTES.CONTACT}>Get in Touch</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Featured FAQs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Quick Answers
          </CardTitle>
          <CardDescription>
            Here are some of the most common questions we receive. For more
            detailed answers, check out our full FAQ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {featuredFAQs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Quick Links
          </CardTitle>
          <CardDescription>
            Jump directly to the features you need help with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" asChild className="justify-start">
              <Link href={ROUTES.MY_RECIPES}>
                <Utensils className="h-4 w-4 mr-2" />
                My Recipes
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href={ROUTES.SHOPPING_LIST}>
                <Users className="h-4 w-4 mr-2" />
                Shopping List
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href={ROUTES.HOUSEHOLDS}>
                <Users className="h-4 w-4 mr-2" />
                Households
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href={ROUTES.CHALKBOARD}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Kitchen Chalkboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Help Us Improve Kitchen Sync
          </CardTitle>
          <CardDescription>
            Your feedback helps us make Kitchen Sync better for everyone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Whether you have suggestions for new features, found a bug, or just
            want to share your experience, we&apos;d love to hear from you! Your
            input helps us prioritize improvements and build the features that
            matter most to our community.
          </p>
          <Button asChild className="w-full">
            <Link href={ROUTES.CONTACT}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Share Your Feedback
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
