import Header2 from "@/app/components/ui/header-2";
import Footer from "@/app/components/Footer";

export default function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <Header2 />
      <main className="pt-24">{children}</main>
      <Footer />
    </div>
  );
}
