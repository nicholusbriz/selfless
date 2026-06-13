import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Sign In - Freedom City Tech Center | Selfless CE",
  description: "Sign in to access your Freedom City Tech Center dashboard. Manage your courses, track progress, and access academic resources. Developed by Selfless CE.",
  keywords: "Freedom City Tech Center login, Seeta Tech Center sign in, Ntinda Teach Center login, Masaka Teach Center sign in, Jinja Tech Center login, Mbale Tech Center sign in, Kololo Stake Center login, Kaboowa Tech Center sign in, Selfless CE, Nicholus Turyamureba, Atbriz, Cyber Touch",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
