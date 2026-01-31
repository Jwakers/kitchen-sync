import { Metadata } from "next";
import MealPlanClient from "./_components/meal-plan-client";

export const metadata: Metadata = {
  title: "Meal planning",
  description: "Plan your week with recipes and generate a shopping list",
};

export default function MealPlanPage() {
  return <MealPlanClient />;
}
