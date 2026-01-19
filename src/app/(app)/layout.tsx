import { Metadata } from "next";
import {
  CannyFeedbackButton,
  CannyIdentify,
} from "./_components.tsx/canny-identify";
import { Header } from "./_components.tsx/header";
import { Navbar } from "./_components.tsx/navbar";

export const metadata: Metadata = {
  title: {
    template: "%s | Kitchen Sync",
    default: "Kitchen Sync",
  },
  description: "Kitchen Sync - Family Meal Planning",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-background safe-area-inset relative grid grid-rows-[auto_1fr_auto] min-h-dvh"
      data-vaul-drawer-wrapper="true"
    >
      <CannyIdentify />
      <Header />
      <main>{children}</main>
      <Navbar />
      <CannyFeedbackButton />
    </div>
  );
}
