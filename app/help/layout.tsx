import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Support | Selfless Student Portal",
  description:
    "Get help with your Selfless Student Portal account — contact support via WhatsApp, phone, or email for account, course, and portal questions.",
  alternates: { canonical: "/help" },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
