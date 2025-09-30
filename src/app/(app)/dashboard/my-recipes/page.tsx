import { Metadata } from "next";
import RecipeListing from "./_components/recipe-listing";

export const metadata: Metadata = {
  title: "My Recipes | Kitchen Sync",
};

export default function MyRecipesPage() {
  return <RecipeListing />;
}
