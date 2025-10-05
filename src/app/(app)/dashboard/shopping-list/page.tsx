import { Metadata } from "next";
import ShoppingListClient from "./_components/shopping-list-client";

export const metadata: Metadata = {
  title: "Shopping List",
  description: "Create a shopping list from your recipes",
};

export default function ShoppingListPage() {
  return <ShoppingListClient />;
}
