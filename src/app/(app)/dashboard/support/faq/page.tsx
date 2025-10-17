"use client";

import { ROUTES } from "@/app/constants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  HelpCircle,
  Shield,
  Smartphone,
  Users,
  Utensils,
  Wrench,
} from "lucide-react";
import Link from "next/link";

export const faqSections = [
  {
    title: "Getting Started",
    icon: <Utensils className="h-5 w-5" />,
    color: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
    questions: [
      {
        question: "How do I create my first recipe?",
        answer:
          "Click the '+' icon from the bottom menu or from the 'My Recipes' page. Fill in the recipe details including ingredients, instructions, and cooking time. You can also add photos and nutritional information.",
      },
      {
        question: "What information do I need to include in a recipe?",
        answer:
          "At minimum, you'll need a recipe name, ingredients list, and cooking instructions. You can also add prep time, cook time, serving size, difficulty level, category, photos, and nutritional information. Recipes can be saved as drafts and continued later.",
      },
      {
        question: "Can I organise my recipes?",
        answer:
          "Yes! You can categorise recipes (main, dessert, snack, etc.), add tags, and use the search function to quickly find specific recipes.",
      },
    ],
  },
  {
    title: "Recipe Features",
    icon: <Utensils className="h-5 w-5" />,
    color: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
    questions: [
      {
        question: "How do I import recipes from websites?",
        answer:
          "Use the 'Import Recipe' feature from the main menu. Paste the URL of any recipe from most cooking websites, and our system will automatically extract the recipe information for you to review and save.",
      },
      {
        question: "Can I edit imported recipes?",
        answer:
          "Absolutely! After importing a recipe, you can edit any part of it - ingredients, instructions, photos, or add your own notes and modifications.",
      },
      {
        question: "How do I add photos to my recipes?",
        answer:
          "When creating or editing a recipe, you can upload photos by clicking the edit recipe button and then the change image button. You can add multiple photos to show different steps or the final result.",
      },
    ],
  },
  {
    title: "Shopping Lists",
    icon: <Users className="h-5 w-5" />,
    color:
      "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
    questions: [
      {
        question: "How do I create a shopping list from recipes?",
        answer:
          "Either from the main navigation or the side menu, click the 'Shopping cart' icon. This will open the shopping list page where you can select recipes to add to your shopping list.",
      },
      {
        question: "How do I share my shopping list with others?",
        answer:
          "If you're part of a household, your shopping list is automatically shared with other household members. They can add items, check off completed items, and see real-time updates. Once you have finalised a shopping list there are multiple sharing options such as message, print or save to notes. But you can always just use the app to see your shopping list and check off items as you shop.",
      },
    ],
  },
  {
    title: "Households & Sharing",
    icon: <Users className="h-5 w-5" />,
    color:
      "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
    questions: [
      {
        question: "What is a household?",
        answer:
          "A household is a shared space where family members or room-mates can collaborate on meal planning, share recipes, and coordinate shopping lists.",
      },
      {
        question: "How do I create or join a household?",
        answer:
          "Go to 'Households' in the main menu. You can either create a new household or join an existing one using an invitation code shared by another member.",
      },
      {
        question: "Can I be part of multiple households?",
        answer:
          "You can be part of multiple households. This is useful if you live with multiple people or have family members that you want to share recipes and shopping lists with.",
      },
      {
        question: "How do I invite others to my household?",
        answer:
          "In your household page, you can generate an invitation code to share with family or friends. They can use this code to join your household.",
      },
    ],
  },
  {
    title: "Kitchen Chalkboard",
    icon: <HelpCircle className="h-5 w-5" />,
    color: "bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400",
    questions: [
      {
        question: "What is the Kitchen Chalkboard?",
        answer:
          "The Kitchen Chalkboard is a quick note-taking feature perfect for jotting down cooking reminders, ingredient substitutions, or any kitchen-related notes. It's like having a digital sticky note in your kitchen.",
      },
      {
        question: "How do I use the Kitchen Chalkboard?",
        answer:
          "Simply go to 'Kitchen Chalkboard' from the main menu and start typing your notes. Your notes are automatically saved and will be visible to other household members if you're part of a household.",
      },
    ],
  },
  {
    title: "Account & Privacy",
    icon: <Shield className="h-5 w-5" />,
    color: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400",
    questions: [
      {
        question: "How do I update my profile information?",
        answer:
          "Click on your profile picture in the navigation menu to access your account settings. From there, you can update your name, email, and other profile information.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Yes, we take data security seriously. All your data is encrypted and stored securely. We never share your personal information or recipes with third parties.",
      },
      {
        question: "What happens if I delete my account?",
        answer:
          "If you delete your account, all your personal data, recipes, and household information will be permanently removed. This action cannot be undone.",
      },
    ],
  },
  {
    title: "Troubleshooting",
    icon: <Wrench className="h-5 w-5" />,
    color:
      "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400",
    questions: [
      {
        question: "The app is running slowly. What should I do?",
        answer:
          "Try closing the app and opening it again or clear your browser cache. If the problem persists, make sure you're using a supported browser and have a stable internet connection.",
      },
      {
        question: "I can't import a recipe from a website. Why?",
        answer:
          "Some websites may not be compatible with our import feature, or the recipe format might be unusual. You can always manually create the recipe instead by copying the text over and pasting it into the import recipe feature.",
      },
      {
        question: "I'm having trouble with the mobile app.",
        answer:
          "Make sure you're using the latest version of your browser and that JavaScript is enabled. The app works best on modern browsers like Chrome, Safari, or Firefox.",
      },
    ],
  },
  {
    title: "Technical Questions",
    icon: <Smartphone className="h-5 w-5" />,
    color:
      "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400",
    questions: [
      {
        question: "Does the app work offline?",
        answer:
          "Some features work offline, but for the best experience, we recommend using the app with an internet connection. This ensures your data syncs properly across devices.",
      },
      {
        question: "Can I use Kitchen Sync on my phone?",
        answer:
          "Yes! Kitchen Sync is a web app that works great on mobile devices. You can add it to your home screen for easy access.",
      },
    ],
  },
];

export default function FAQPage() {
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
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Frequently Asked Questions</h1>
        </div>
        <p className="text-muted-foreground">
          Find answers to common questions about using Kitchen Sync.
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-6">
        {faqSections.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${section.color}`}>
                  {section.icon}
                </div>
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {section.questions.map((faq, faqIndex) => (
                  <AccordionItem
                    key={faqIndex}
                    value={`${sectionIndex}-${faqIndex}`}
                  >
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
        ))}
      </div>

      {/* Contact CTA */}
      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-4">
              Can&apos;t find the answer you&apos;re looking for? We&apos;re
              here to help!
            </p>
            <Button asChild>
              <Link href={ROUTES.CONTACT}>Contact Support</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
