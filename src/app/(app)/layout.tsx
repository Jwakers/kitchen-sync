import { Metadata } from "next";
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
      className="bg-background safe-area-inset"
      data-vaul-drawer-wrapper="true"
    >
      <Header />
      <main className="pb-20">{children}</main>
      <Navbar />
    </div>
  );
}
