import { Metadata } from "next";
import ChalkboardClient from "./_components/chalkboard-client";

export const metadata: Metadata = {
  title: "Kitchen Chalkboard",
  description: "Quick notes and items for your shopping lists",
};

export default function ChalkboardPage() {
  return <ChalkboardClient />;
}

