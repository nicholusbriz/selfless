import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features | Selfless Student Portal",
  description:
    "Explore everything the Selfless Student Portal offers — dashboard, academic progress, communication, community, opportunities, and Atbriz AI in one connected experience.",
  alternates: { canonical: "/features" },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
