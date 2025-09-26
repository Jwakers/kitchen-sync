import { Navbar } from "./_components.tsx/navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20">{children}</main>
      <Navbar />
    </div>
  );
}
