import { Footer } from "@/app/(site)/_components/footer";
import { Header } from "@/app/(site)/_components/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
