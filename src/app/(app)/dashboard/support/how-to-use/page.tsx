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
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Clipboard,
  Globe,
  Home,
  Plus,
  Search,
  ShoppingCart,
  Users,
  Utensils,
} from "lucide-react";
import Link from "next/link";

export default function HowToUsePage() {
  const gettingStartedSteps = [
    {
      step: 1,
      title: "Sign up for an account",
      description:
        "Create your Kitchen Sync account to start organising your recipes and meal planning.",
      icon: <Users className="h-5 w-5" />,
    },
    {
      step: 2,
      title: "Create your first recipe",
      description:
        "Add a recipe you love to get started. You can create one from scratch or import from a website.",
      icon: <Plus className="h-5 w-5" />,
    },
    {
      step: 3,
      title: "Set up your household",
      description:
        "Invite family members or room-mates to collaborate on meal planning and share recipes.",
      icon: <Home className="h-5 w-5" />,
    },
    {
      step: 4,
      title: "Create your first shopping list",
      description:
        "Generate a shopping list from your recipes to make meal planning and shopping easier.",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
  ];

  const featureGuides = [
    {
      title: "Recipe Management",
      icon: <Utensils className="h-5 w-5" />,
      color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
      sections: [
        {
          title: "Creating a Recipe",
          content: [
            "1. Click the \"+\" icon from the bottom menu or from the 'My Recipes' page",
            " icon from the bottom menu or from the 'My Recipes' page",
            "3. Fill in the recipe name and description",
            "4. Add ingredients with quantities and units",
            "5. Write step-by-step cooking instructions",
            "6. Set prep time, cook time, and serving size",
            "7. Choose a category (main, dessert, snack, etc.)",
            "8. Upload photos if desired",
            "9. Click 'Save Recipe'",
          ],
        },
        {
          title: "Editing Recipes",
          content: [
            "1. Go to 'My Recipes' and find the recipe you want to edit",
            "2. Click on the recipe to open it",
            "3. Click the 'Edit' button",
            "4. Make your changes to any part of the recipe",
            "5. Click 'Save Changes' when done",
          ],
        },
        {
          title: "Organising Recipes",
          content: [
            "• Use categories to group similar recipes",
            "• Use the search function to find recipes quickly",
            "• Sort recipes by name, date created, or category",
          ],
        },
      ],
    },
    {
      title: "Importing Recipes",
      icon: <Globe className="h-5 w-5" />,
      color:
        "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
      sections: [
        {
          title: "From Websites",
          content: [
            "1. Go to 'Import Recipe' from the main menu",
            "2. Paste the URL of the recipe you want to import",
            "3. Click 'Import Recipe'",
            "4. Review the extracted information",
            "5. Make any necessary edits or additions",
            "6. Click 'Save Recipe' to add it to your collection",
          ],
        },
        {
          title: "Supported Websites",
          content: [
            "• Most major cooking websites (Allrecipes, Food Network, etc.)",
            "• Food blogs with standard recipe formats",
            "• Recipe sites with structured data",
            "• Note: Some sites may not be compatible due to their format",
          ],
        },
        {
          title: "Manual Import",
          content: [
            "If automatic import doesn't work:",
            "1. Copy the recipe text from the website",
            "2. Use the 'Create Recipe' feature instead",
            "3. Paste the information manually",
            "4. Organise and format as needed",
          ],
        },
      ],
    },
    {
      title: "Shopping Lists",
      icon: <ShoppingCart className="h-5 w-5" />,
      color:
        "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
      sections: [
        {
          title: "Creating from Recipes",
          content: [
            "1. Open any recipe you want to cook",
            "2. Click 'Add to Shopping List'",
            "3. All ingredients will be added automatically",
            "4. Go to 'Shopping List' to view and organize",
            "5. Check off items as you shop",
          ],
        },
        {
          title: "Manual Shopping Lists",
          content: [
            "1. Go to 'Shopping List' from the main menu",
            "2. Select recipes to add to your shopping list",
            "3. Select whether to include personal chalkboard items and/or household chalkboard items",
            "4. Click 'Create Shopping List'",
          ],
        },
      ],
    },
    {
      title: "Households & Collaboration",
      icon: <Users className="h-5 w-5" />,
      color:
        "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
      sections: [
        {
          title: "Creating a Household",
          content: [
            "1. Go to 'Households' from the main menu",
            "2. Click 'Create Household'",
            "3. Enter a name for your household",
            "4. Generate an invitation code",
            "5. Share the code with family members or room-mates",
          ],
        },
        {
          title: "Joining a Household",
          content: [
            "1. Get the invitation code from a household member",
            "2. Follow the link and accept the invitation",
            "3. You'll now have access to shared recipes and shopping lists",
          ],
        },
        {
          title: "Collaborative Features",
          content: [
            "• Select recipes to share with household members",
            "• Shopping lists and chalkboard notes are collaborative and update in real-time",
            "• Kitchen Chalkboard notes are visible to all members",
            "• Each member can add, edit, and organise shared content",
            "• Changes are synchronised across all devices",
          ],
        },
      ],
    },
    {
      title: "Kitchen Chalkboard",
      icon: <Clipboard className="h-5 w-5" />,
      color: "bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400",
      sections: [
        {
          title: "Using the Chalkboard",
          content: [
            "1. Go to 'Kitchen Chalkboard' from the main menu",
            "2. Click in the text area to start typing",
            "3. Your notes are automatically saved",
            "4. Use it for cooking reminders, substitutions, or quick notes",
            "5. Notes are shared with household members if applicable",
          ],
        },
        {
          title: "Best Practices",
          content: [
            "• Keep notes concise and easy to read",
            "• Use for temporary cooking reminders",
            "• Note ingredient substitutions or modifications",
            "• Share cooking tips with household members",
            "• Clear old notes regularly to keep it useful",
          ],
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={ROUTES.SUPPORT} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Support
          </Link>
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">How to Use Kitchen Sync</h1>
        </div>
        <p className="text-muted-foreground">
          Learn how to get the most out of Kitchen Sync with our comprehensive
          guides.
        </p>
      </div>

      {/* Getting Started */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            Getting Started
          </CardTitle>
          <CardDescription>
            Follow these steps to set up Kitchen Sync and start organizing your
            recipes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {gettingStartedSteps.map((step, index) => (
              <div key={index} className="flex gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 bg-muted rounded">{step.icon}</div>
                    <h3 className="font-semibold">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Guides */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Feature Guides</h2>

        {featureGuides.map((guide, guideIndex) => (
          <Card key={guideIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${guide.color}`}>
                  {guide.icon}
                </div>
                {guide.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {guide.sections.map((section, sectionIndex) => (
                  <AccordionItem
                    key={sectionIndex}
                    value={`${guideIndex}-${sectionIndex}`}
                  >
                    <AccordionTrigger className="text-left">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 text-muted-foreground">
                        {section.content.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="flex items-start gap-2"
                          >
                            {item.startsWith("•") ? (
                              <span className="text-primary mt-1">•</span>
                            ) : item.match(/^\d+\./) ? (
                              <span className="text-primary text-sm font-medium mt-0.5">
                                {item.split(".")[0]}.
                              </span>
                            ) : (
                              <span className="text-primary mt-1">•</span>
                            )}
                            <span>
                              {item
                                .replace(/^\d+\.\s*/, "")
                                .replace(/^•\s*/, "")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Tips */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Search className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Search & Organization</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use the search function to quickly find recipes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Efficiency Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Import recipes from websites to save time</li>
                <li>• Create shopping lists directly from recipes</li>
                <li>• Use the chalkboard for pantry ingredient reminders</li>
                <li>
                  • Share recipes and shopping lists with household members
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact CTA */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Need more help?</h3>
            <p className="text-muted-foreground mb-4">
              If you have questions not covered in this guide, we&apos;re here
              to help!
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link href={ROUTES.SUPPORT_FAQ}>Browse FAQ</Link>
              </Button>
              <Button asChild>
                <Link href={ROUTES.CONTACT}>Contact Support</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
