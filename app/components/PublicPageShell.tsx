"use client";

import Header2 from "@/app/components/ui/header-2";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/lib/hooks/useAuth";
import { useOnlineUsers } from "@/lib/hooks/useOnlineUsers";

export default function PublicPageShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { users: onlineUsers, isLoading: isLoadingOnlineUsers } = useOnlineUsers(user);

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <Header2 onlineUsers={onlineUsers} isLoadingOnlineUsers={isLoadingOnlineUsers} />
      <main className="pt-24">{children}</main>
      <Footer />
    </div>
  );
}
