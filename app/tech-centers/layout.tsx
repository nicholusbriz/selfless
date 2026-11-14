import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Center Network | Selfless Student Portal",
  description:
    "Selfless unites all of its tech centers through one student portal — a consistent digital experience for learning, community, and support.",
  alternates: { canonical: "/tech-centers" },
};

export default function TechCentersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
