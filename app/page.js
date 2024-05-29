import { Suspense } from 'react';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ButtonLead from "@/components/ButtonLead";
import HeroVideo from "@/components/HeroVideo";
import TestimonialRating from "@/components/TestimonialRating";
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
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}