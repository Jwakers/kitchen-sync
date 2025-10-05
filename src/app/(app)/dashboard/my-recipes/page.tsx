import { Metadata } from "next";
import RecipeListing from "./_components/recipe-listing";

export const metadata: Metadata = {
  title: "My Recipes",
  description: "Manage and organise your culinary creations",
};

export default function MyRecipesPage() {
  return <RecipeListing />;
}
