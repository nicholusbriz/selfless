"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";
import { useState } from "react";

export default function CTASection() {
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');

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
    <section className="relative overflow-hidden bg-[#0D1117] py-16">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(232,163,61,.08),transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-xl border border-[#E8A33D]/20 bg-gradient-to-br from-[#111827] to-[#1A2233] p-8 md:p-10 text-center"
        >
          {/* Badge */}
          <span className="inline-flex rounded-full border border-[#E8A33D]/20 bg-[#E8A33D]/10 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[#F2C879]">
            Begin Your Journey
          </span>

          {/* Heading */}
          <h2 className="mt-4 text-3xl md:text-5xl font-black text-white">
            Ready To Start?
          </h2>

          {/* Description */}
          <p className="mx-auto mt-3 max-w-2xl text-base leading-6 text-gray-400">
            Access the Official Selfless Student Self Service Portal
            and manage every aspect of your academic journey from one
            intelligent platform.
          </p>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {isAuthenticated && user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[#E8A33D] px-6 py-3 font-semibold text-black transition hover:scale-105 hover:bg-[#C97F1F]"
              >
                Go to Dashboard
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <button
                  onClick={handleRegister}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E8A33D] px-6 py-3 font-semibold text-black transition hover:scale-105 hover:bg-[#C97F1F]"
                >
                  Create Account
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={handleSignIn}
                  className="rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 font-medium text-white transition hover:border-[#E8A33D]/40 hover:bg-white/10"
                >
                  Student Login
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={closeAuthModal}
        defaultType={authModalType}
      />
    </section>
  );
}