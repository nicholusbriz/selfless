import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Selfless Student Portal",
  description:
    "Learn about the Selfless Student Portal — one connected platform for students to manage academic progress, stay connected to their tech center, and move their education forward.",
  alternates: { canonical: "/about" },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
