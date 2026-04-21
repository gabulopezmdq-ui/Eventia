"use client";

import React, { useState } from "react";
import HeroSection from "../components/landing/HeroSection";
import B2BLeadModal from "../components/landing/B2BLeadModal";
import PricingSection from "../components/landing/PricingSection";
import HowItWorks from "../components/landing/HowItWorks";
import StarModules from "../components/landing/StarModules";

export default function Home() {
  const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <HeroSection onOpenB2BModal={() => setIsB2BModalOpen(true)} />

      <HowItWorks />
      <StarModules />

      <PricingSection onOpenB2BModal={() => setIsB2BModalOpen(true)} />

      {/* MODAL PROSPECTOS B2B */}
      <B2BLeadModal isOpen={isB2BModalOpen} onClose={() => setIsB2BModalOpen(false)} />
    </main>
  );
}
