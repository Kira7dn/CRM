import { Container } from "../ui/Container";
import { Button } from "@shared/ui/button";
import { CheckCircle2, Phone } from "lucide-react";
import brandConfig from "@/config/brand.json";
import Image from "next/image";

export function FinalCTASection() {
  return (
    <section id="contact" className="py-6 md:py-12 bg-linear-to-br from-brand-crystal to-blue-600 text-white relative overflow-hidden">

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              {brandConfig.finalCTA.title}
            </h2>
            <p className="text-xl md:text-2xl text-white/90">
              {brandConfig.finalCTA.subtitle}
            </p>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 py-2">
            {brandConfig.finalCTA.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-white/90">
                <CheckCircle2 className="w-5 h-5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-brand-golden text-brand-charcoal hover:bg-brand-golden/90 shadow-2xl font-bold px-8 py-6 text-lg"
            >
              {brandConfig.finalCTA.buttons.primary.text}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-primary hover:bg-white/20 backdrop-blur-sm font-semibold px-8 py-6 text-lg"
            >
              {brandConfig.finalCTA.buttons.secondary.text}
            </Button>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 pt-2 border-t border-white/20">
            <a
              href={`tel:${brandConfig.contact.phone}`}
              className="flex items-center gap-2 text-white hover:text-brand-golden transition-all duration-300 hover:scale-105 hover:drop-shadow-lg"
            >
              <Phone className="w-5 h-5" />
              <span className="font-semibold">{brandConfig.contact.phone}</span>
            </a>
            <a
              href={brandConfig.contact.socialMedia.zalo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-brand-golden transition-all duration-300 hover:scale-105 hover:drop-shadow-[0_8px_16px_rgba(0,104,255,0.4)]"
            >
              <Image
                src="/icons/Zalo.svg"
                alt="Zalo"
                width={20}
                height={20}
                className="transition-all duration-300"
              />
              <span className="font-semibold">Zalo OA</span>
            </a>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-white/70 pt-2">
            {brandConfig.finalCTA.trustBadge}
          </p>
        </div>
      </Container>
    </section>
  );
}
