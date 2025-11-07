import Header from "./components/Header";
import { HeroSection } from "./components/sections/HeroSection";
import { ValuePropsSection } from "./components/sections/ValuePropsSection";
import { ProductsSection } from "./components/sections/ProductsSection";
import { TraceabilitySection } from "./components/sections/TraceabilitySection";
import { CoToStorySection } from "./components/sections/CoToStorySection";
import { SustainabilitySection } from "./components/sections/SustainabilitySection";
import { TestimonialsSection } from "./components/sections/TestimonialsSection";
import { CSRSection } from "./components/sections/CSRSection";
import { FinalCTASection } from "./components/sections/FinalCTASection";
import { Footer } from "./components/sections/Footer";

/**
 * Landing Page - Ngày Mới Cô Tô
 *
 * Structured following Clean Architecture principles with:
 * - Modular section components
 * - Reusable UI components with CVA variants
 * - Design system from landing-page.md
 * - Mobile-first responsive design
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Navigation Header */}
      <Header />

      {/* Main Content - 10 Sections */}
      <main>
        {/* Section 1: Hero - Full screen hero with animated bubbles background */}
        <HeroSection />

        {/* Section 2: Value Propositions - 3 pillars (Transparency, Flavor, Impact) */}
        <div id="value-props">
          <ValuePropsSection />
        </div>

        {/* Section 3: Featured Products - Product carousel with best sellers */}
        <div id="products">
          <ProductsSection />
        </div>

        {/* Section 4: Traceability System - QR code demo, USP showcase */}
        <TraceabilitySection />

        {/* Section 5: Cô Tô Origin Story - Origin story about special seawater */}
        <CoToStorySection />

        {/* Section 6: Sustainability - Process timeline with certifications */}
        <SustainabilitySection />

        {/* Section 7: Customer Testimonials - Social proof */}
        <div id="testimonials">
          <TestimonialsSection />
        </div>

        {/* Section 8: CSR & Impact - Social impact with real numbers */}
        <CSRSection />

        {/* Section 9: Final CTA - Strong conversion section */}
        <FinalCTASection />

        {/* Section 10: Footer - Complete information */}
        <Footer />
      </main>
    </div>
  );
}
