"use client";

import Header2 from "@/app/components/ui/header-2";
import { useAuth } from "@/lib/hooks/useAuth";
import { useOnlineUsers } from "@/lib/hooks/useOnlineUsers";
import { usePathname } from "next/navigation";

const publicHeaderPaths = new Set([
  "/",
  "/about",
  "/tech-centers",
  "/features",
  "/help",
  "/privacy",
  "/terms",
]);

export default function PersistentPublicHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { users, isLoading } = useOnlineUsers(user, {
    includeCurrentUser: true,
  });

  if (!publicHeaderPaths.has(pathname)) return null;

  return <Header2 onlineUsers={users} isLoadingOnlineUsers={isLoading} />;
}
