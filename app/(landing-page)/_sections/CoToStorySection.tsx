import * as React from "react";
import Image from "next/image";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Card, CardContent } from "@shared/ui/card";
import { Icon } from "@shared/ui/icon";
import brandConfig from "@/config/brand.json";

const characteristics = brandConfig.coToStory.characteristics;

const images = brandConfig.coToStory.images;

export function CoToStorySection() {
  return (
    <section id="coto-story" className="relative overflow-hidden">
      {/* Hero Image Section */}
      <div className="relative h-[60vh] md:h-[60vh] w-full">
        <Image
          src="/coto/coto-aerial2.png"
          alt="Cô Tô từ trên cao"
          fill
          className="object-cover"
          style={{ filter: "brightness(0.7)" }}
        />
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/50" />

        {/* Heading and Stats Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {/* Heading on Image - Top */}
          <div className="flex items-start pt-12 md:pt-16">
            <Container>
              <div className="max-w-3xl">
                <SectionHeading
                  level="h2"
                  showDecorator
                  decoratorColor="crystal"
                  color="white"
                  align="left"
                  subtitle={brandConfig.coToStory.subtitle}
                  subtitleColor="white"
                >
                  {brandConfig.coToStory.title}
                </SectionHeading>
              </div>
            </Container>
          </div>

          {/* Stats/Facts Bar - Bottom */}
          <div>
            <Container className="py-3 md:py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {characteristics.map((char, index) => {
                  return (
                    <div
                      key={index}
                      className="text-left flex gap-3 md:gap-4 bg-white/15 backdrop-blur-sm rounded-md border border-white/30 max-w-xs p-3 md:p-5"
                    >
                      <div className={`shrink-0 inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full ${char.bgColor} mt-1`}>
                        <Icon type={char.icon} className={`w-4 h-4 md:w-6 md:h-6 ${char.color}`} />
                      </div>
                      <div className="text-sm md:text-lg font-bold text-white mb-1 drop-shadow">
                        {char.value}
                        <p className="text-white/95 text-xs md:text-sm drop-shadow-sm leading-tight font-medium">{char.label}</p>
                        <p className="text-white/80 text-xs drop-shadow-sm leading-relaxed mt-1 md:mt-2 hidden md:block">{char.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Container>
          </div>
        </div>
      </div>

      {/* Main Story Content */}
      <div className="py-10 md:py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Left: Text Content */}
            <div className="space-y-6 h-full">
              <h3 className="text-3xl md:text-4xl font-bold text-brand-charcoal text-left">
                Tại sao Cô Tô đặc biệt?
              </h3>

              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                {brandConfig.coToStory.story.map((paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="border-l-4 border-brand-crystal pl-6 py-4 bg-brand-sand/30 rounded-r-lg">
                <p className="text-lg italic text-gray-700 mb-2">
                  "{brandConfig.coToStory.quote.text}"
                </p>
                <footer className="text-sm text-gray-600">
                  — {brandConfig.coToStory.quote.author}
                </footer>
              </blockquote>
            </div>

            {/* Right: Images Gallery */}
            <div className="grid grid-cols-1 gap-4 md:gap-6 h-full overflow-y-auto">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative bg-linear-to-t from-transparent to-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-4 md:p-6 group aspect-square md:aspect-auto"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4">
                    <p className="text-white font-semibold text-sm md:text-base">{image.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Optional: Wave Divider */}
      <div className="relative h-16 bg-white">
        <svg
          className="absolute bottom-0 w-full h-16"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C300,80 600,80 900,40 C1050,20 1150,40 1200,60 L1200,120 L0,120 Z"
            fill="var(--brand-crystal)"
          />
        </svg>
      </div>
    </section>
  );
}
