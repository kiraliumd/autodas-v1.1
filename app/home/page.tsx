import type { Metadata } from "next"
import { LandingHero } from "@/components/landing/hero"
import { LandingHeader } from "@/components/landing/header"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Benefits } from "@/components/landing/benefits"
import { PricingSection } from "@/components/landing/pricing"
import { Testimonials } from "@/components/landing/testimonials"
import { FAQ } from "@/components/landing/faq"
import { FinalCTA } from "@/components/landing/final-cta"
import { Footer } from "@/components/landing/footer"
import { FloatingCTA } from "@/components/landing/floating-cta"

export const metadata: Metadata = {
  title: "Autodas - Guia DAS MEI Automática no WhatsApp",
  description: "Com o Autodas, sua guia DAS MEI chega automaticamente no WhatsApp todo mês. Experimente agora!",
  openGraph: {
    title: "Autodas - Guia DAS MEI Automática no WhatsApp",
    description: "Com o Autodas, sua guia DAS MEI chega automaticamente no WhatsApp todo mês. Experimente agora!",
    images: [
      {
        url: "/images/autodas-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Autodas - Plataforma para MEI",
      },
    ],
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <HowItWorks />
        <Benefits />
        <PricingSection />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <FloatingCTA />
    </div>
  )
}
