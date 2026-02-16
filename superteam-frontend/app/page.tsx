import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/landing/hero-section"
import { StatsSection } from "@/components/landing/stats-section"
import { PathsSection } from "@/components/landing/paths-section"
import { FeaturesSection } from "@/components/landing/features-section"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { CtaSection } from "@/components/landing/cta-section"
import { cookies } from "next/headers"
import {
  getWalletSessionCookieName,
  verifyAccessToken,
} from "@/lib/server/wallet-auth"
import { redirect } from "next/navigation"

export default async function LandingPage() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(getWalletSessionCookieName())?.value
  const user = await verifyAccessToken(accessToken)

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <PathsSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
