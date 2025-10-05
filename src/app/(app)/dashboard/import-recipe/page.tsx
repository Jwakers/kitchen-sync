import { Metadata } from "next";
import { ImportRecipeClient } from "./_components/import-recipe-client";

export const metadata: Metadata = {
  title: "Import Recipe",
  description: "Import recipes from other websites",
};

export default function ImportRecipePage() {
  return <ImportRecipeClient />;
}
