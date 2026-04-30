"use client";

import React, { useState } from "react";
import Link from "next/link";
import HeroSection from "../components/landing/HeroSection";
import B2BLeadModal from "../components/landing/B2BLeadModal";
import PricingSection from "../components/landing/PricingSection";
import HowItWorks from "../components/landing/HowItWorks";
import StarModules from "../components/landing/StarModules";

export default function Home() {
  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans relative">
      {/* Navigation Bar */}
      <nav className="absolute top-0 w-full z-50 px-6 py-6">
        <div className="mx-auto max-w-7xl flex items-center justify-end">
          <Link
            href="/login"
            className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Iniciar sesión
          </Link>
        </div>
      </nav>

      <HeroSection onOpenB2BModal={() => setIsB2BModalOpen(true)} />

      <HowItWorks />
      <StarModules />

      <PricingSection onOpenB2BModal={() => setIsB2BModalOpen(true)} />

      {/* MODAL PROSPECTOS B2B */}
      <B2BLeadModal isOpen={isB2BModalOpen} onClose={() => setIsB2BModalOpen(false)} />
    </main>
  );
}
