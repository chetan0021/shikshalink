import { Navbar } from "@/app/components/ui/Navbar";
import { Hero } from "@/app/components/landing/Hero";
import { ProblemSection } from "@/app/components/landing/ProblemSection";
import { IndiaMap } from "@/app/components/landing/IndiaMap";
import { HowItWorks } from "@/app/components/landing/HowItWorks";
import { StoryTimeline } from "@/app/components/landing/StoryTimeline";
import { ImpactNumbers } from "@/app/components/landing/ImpactNumbers";
import { TechStack } from "@/app/components/landing/TechStack";
import { CTABanner } from "@/app/components/landing/CTABanner";
import { Footer } from "@/app/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-dvh bg-[var(--sl-paper)]">
      <Navbar />
      <Hero />
      <ProblemSection />
      <IndiaMap />
      <HowItWorks />
      <StoryTimeline />
      <ImpactNumbers />
      <TechStack />
      <CTABanner />
      <Footer />
    </main>
  );
}

