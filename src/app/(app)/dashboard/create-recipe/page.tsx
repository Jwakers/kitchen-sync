import { Metadata } from "next";
import { CreateRecipeClient } from "./_components/create-recipe-client";

export const metadata: Metadata = {
  title: "Create Recipe",
  description: "Create a new recipe from scratch",
};

export default function CreateRecipePage() {
  return <CreateRecipeClient />;
}
