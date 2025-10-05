import { Metadata } from "next";
import ShoppingListClient from "./_components/shopping-list-client";

export const metadata: Metadata = {
  title: "Shopping List",
};

export default function ShoppingListPage() {
  return <ShoppingListClient />;
}
