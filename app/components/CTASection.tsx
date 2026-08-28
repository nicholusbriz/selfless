"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import AuthModal from "@/components/auth/AuthModal";

export default function CTASection() {
  const { isAuthenticated, user } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<"login" | "register">(
    "login"
  );

  const handleSignIn = () => {
    setAuthModalType("login");
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    setAuthModalType("register");
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <section className="relative overflow-hidden bg-[#0D1117] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-xl border border-[#E8A33D]/20 bg-[#111923]"
        >
          {/* Subtle accent line */}
          <div className="h-1 w-full bg-[#E8A33D]" />

          <div className="px-5 py-9 text-center sm:px-8 sm:py-11 lg:px-12 lg:py-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8A33D]/20 bg-[#E8A33D]/[0.07] px-3.5 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8A33D]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E8A33D]">
                Begin Your Journey
              </span>
            </div>

            {/* Heading */}
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[46px]">
              Ready to take control of your
              <span className="block text-[#E8A33D]">
                academic journey?
              </span>
            </h2>

            {/* Description */}
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              Access the Selfless Student Self Service Portal and keep your
              courses, assignments, attendance, communication, and academic
              progress organized in one place.
            </p>

            {/* Actions */}
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              {isAuthenticated && user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E8A33D] px-5 py-3 text-sm font-semibold text-[#101010] transition-colors duration-200 hover:bg-[#C97F1F] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/50 focus:ring-offset-2 focus:ring-offset-[#111923]"
                >
                  Go to Dashboard
                  <ArrowRight size={16} strokeWidth={2} />
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#E8A33D] px-5 py-3 text-sm font-semibold text-[#101010] transition-colors duration-200 hover:bg-[#C97F1F] focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/50 focus:ring-offset-2 focus:ring-offset-[#111923]"
                  >
                    Create Account
                    <ArrowRight size={16} strokeWidth={2} />
                  </button>

                  <button
                    type="button"
                    onClick={handleSignIn}
                    className="inline-flex items-center justify-center rounded-lg border border-white/[0.12] bg-white/[0.03] px-5 py-3 text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-[#E8A33D]/30 hover:bg-[#E8A33D]/[0.07] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#E8A33D]/40 focus:ring-offset-2 focus:ring-offset-[#111923]"
                  >
                    Student Login
                  </button>
                </>
              )}
            </div>

            {/* Trust points */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <TrustPoint text="Centralized academic tools" />
              <TrustPoint text="Accessible across devices" />
              <TrustPoint text="Built for students" />
            </div>
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

function TrustPoint({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
      <CheckCircle2
        size={13}
        strokeWidth={1.8}
        className="text-[#E8A33D]"
      />
      {text}
    </span>
  );
}