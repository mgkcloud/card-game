"use client"; // Add this line at the top

import React, { useState, Suspense } from 'react';
import Header from "@/components/Header";
import Problem from "@/components/Problem";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import HeroVideo from "@/components/HeroVideo";
import FeaturesGrid from "@/components/FeaturesGrid";

export default function Home() {

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>
      <main>
        <HeroVideo />

        <Problem />

        <FeaturesGrid />

        <Pricing />
        <CTA />

      </main>
      <Footer />
    </>
  );
}