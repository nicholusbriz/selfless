"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { useState } from "react";
import { useTenant } from "@/lib/contexts/TenantContext";

export default function CTASection() {
  const { isAuthenticated, user } = useAuth();
  const { currentTechCenter } = useTenant();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');
  
  const primaryColor = currentTechCenter?.color || '#000000';

  const handleSignIn = () => {
    setAuthModalType('login');
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    setAuthModalType('register');
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <section className="py-4">
      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
        <h2 className="text-base font-semibold text-foreground mb-2">Get Started</h2>
        <div className="flex gap-2">
          {isAuthenticated && user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground transition hover:scale-105"
              style={{ backgroundColor: primaryColor }}
            >
              Dashboard
              <ArrowRight size={14} />
            </Link>
          ) : (
            <>
              <button
                onClick={handleRegister}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground transition hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                Sign Up
                <ArrowRight size={14} />
              </button>
              <button
                onClick={handleSignIn}
                className="rounded-lg border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        defaultType={authModalType}
      />
    </section>
  );
}