import { Header } from "./_components.tsx/header";
import { Navbar } from "./_components.tsx/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20">{children}</main>
      <Navbar />
    </div>
  );
}
