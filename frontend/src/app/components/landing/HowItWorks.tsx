"use client";

import { Bot, GraduationCap, IndianRupee, MessageCircle } from "lucide-react";

import { FeatureCard } from "@/app/components/ui/FeatureCard";

export function HowItWorks() {
  return (
    <section id="platform" className="scroll-mt-28 bg-sl-light py-20 text-sl-text">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-xs font-medium uppercase tracking-[0.14em] text-sl-primary">
          THE PLATFORM
        </div>
        <h2 className="mt-3 font-display text-3xl md:text-4xl">
          Four Modules. One Connected System.
        </h2>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <FeatureCard
            icon={Bot}
            title="Admin Bot"
            description="Auto-fills govt forms so Manjunath can teach, not type."
            href="#"
            accent="teal"
          />
          <FeatureCard
            icon={MessageCircle}
            title="Parent Voice AI"
            description="Yellamma speaks Kannada into WhatsApp. We hear dropout risk."
            href="#"
            accent="purple"
          />
          <FeatureCard
            icon={GraduationCap}
            title="Career Mapper"
            description="Preetham discovers a solar apprenticeship in Tumkur. In 3 clicks."
            href="#"
            accent="amber"
          />
          <FeatureCard
            icon={IndianRupee}
            title="Budget AI"
            description="School grants matched to approved vendors. Automatically."
            href="#"
            accent="indigo"
          />
        </div>

        <div id="how" className="sr-only scroll-mt-28" />
      </div>
    </section>

  );
}

