"use client";

import Footer from "@/app/components/Footer";

export default function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <main>{children}</main>
      <Footer />
    </div>
  );
}
