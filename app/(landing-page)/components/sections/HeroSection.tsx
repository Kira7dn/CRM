"use client";

import * as React from "react";
import brandConfig from "@/config/brand.json";
import HeroCarousel from "../HeroCarousel";
import { CheckCircle2, Snowflake, Recycle } from "lucide-react";

export interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={`relative overflow-hidden`} style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 30%, #0891b2 70%, #0d9488 100%)' }}>
      {/* Animated SVG bubbles */}
      <svg className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <radialGradient id="bubbleFill" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
            <stop offset="35%" stopColor="rgba(6,182,212,0.35)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0.05)" />
          </radialGradient>
          <radialGradient id="bubbleFillSmall" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="40%" stopColor="rgba(8,145,178,0.35)" />
            <stop offset="100%" stopColor="rgba(8,145,178,0.05)" />
          </radialGradient>
          <filter id="blurFar">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
          </filter>
          <filter id="blurMid">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
          </filter>
        </defs>
        <g className="bubbles-large" stroke="#06b6d4" strokeWidth="3" strokeOpacity="0.6" fill="url(#bubbleFill)" filter="url(#blurMid)">
          <g transform="translate(10 940)">
            <circle cx="26" cy="26" r="26" />
          </g>
          <g transform="translate(373 1071)">
            <circle cx="26" cy="26" r="26" />
          </g>
          <g transform="translate(493 1055)">
            <circle cx="26" cy="26" r="26" />
          </g>
          <g transform="translate(970 985)">
            <circle cx="26" cy="26" r="26" />
          </g>
          <g transform="translate(492 1084)">
            <circle cx="26" cy="26" r="26" />
          </g>
        </g>
        <g className="bubbles-small" stroke="#0891b2" strokeWidth="1.5" strokeOpacity="0.5" fill="url(#bubbleFillSmall)" filter="url(#blurFar)">
          <g transform="translate(147 984)"><circle cx="10" cy="10" r="10" /></g>
          <g transform="translate(526 802)"><circle cx="10" cy="10" r="10" /></g>
          <g transform="translate(606 944)"><circle cx="10" cy="10" r="10" /></g>
          <g transform="translate(727 851)"><circle cx="10" cy="10" r="10" /></g>
          <g transform="translate(753 1014)"><circle cx="10" cy="10" r="10" /></g>
          <g transform="translate(947 1020)"><circle cx="10" cy="10" r="10" /></g>
          <g transform="translate(992 950)"><circle cx="10" cy="10" r="10" /></g>
          <g transform="translate(1095 831)"><circle cx="10" cy="10" r="10" /></g>
          <g transform="translate(1204 986)"><circle cx="10" cy="10" r="10" /></g>
          <g transform="translate(1385 940)"><circle cx="10" cy="10" r="10" /></g>
        </g>
      </svg>

      {/* Gradient orbs */}
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.2) 0%, rgba(14,165,233,0.05) 70%)' }}></div>
      <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full blur-3xl animate-pulse" style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.2) 0%, rgba(13,148,136,0.05) 70%)', animationDelay: '1s' }}></div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-4 md:py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-center">
          {/* Left: Text Content */}
          <div className="lg:col-span-4 text-center animate-fade-in-up pr-6 pt-4">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6 flex flex-col items-center"
              style={{ perspective: '500px', animationDelay: '1s' }}
            >
              <span
                className="text-white drop-shadow-lg animate-float"
                style={{
                  transform: 'rotateX(20deg) translateZ(30px)',
                  transformStyle: 'preserve-3d',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.15)',
                  animationDelay: '1.2s',
                }}
              >
                {brandConfig.hero.title.line1}
              </span>
              <span
                className="text-cyan-300 drop-shadow-lg animate-float -mt-7"
                style={{
                  transform: 'rotateX(-20deg) translateZ(30px)',
                  transformStyle: 'preserve-3d',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3), 0 1px 2px rgba(6,182,212,0.4)',
                  animationDelay: '1.8s',
                }}
              >
                {brandConfig.hero.title.line2}
              </span>
              <span
                className="animate-pulse mt-3"
                style={{
                  background: 'var(--brand-golden)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradientShift 4s ease-in-out infinite, glowPulse 3s ease-in-out infinite alternate',
                  textShadow: '0 0 20px rgba(251,191,36,0.2), 0 0 20px rgba(251,191,36,0.2), 0 0 20px rgba(251,191,36,0.2)',
                  transform: 'scale(1.2) translateZ(30px)',
                  animationDelay: '1.5s',
                }}
              >
                {brandConfig.hero.title.line3}
              </span>
            </h1>
            <p className="text-lg md:text-xl max-w-xl mx-auto animate-fade-in-up" style={{ color: '#2B2B2B', textShadow: '0 2px 4px rgba(255,255,255,0.3)', animationDelay: '2s' }}>
              {brandConfig.brand.tagline}
            </p>
            <p className="text-lg md:text-xl mb-4 sm:mb-1 max-w-xl mx-auto animate-fade-in-up" style={{ color: '#2B2B2B', textShadow: '0 2px 4px rgba(255,255,255,0.3)', animationDelay: '2s' }}>
              {brandConfig.brand.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4 sm:mb-1 animate-fade-in-up" style={{ animationDelay: '2.2s' }}>
              <a
                href={brandConfig.hero.cta.primary.link}
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition-all transform hover:scale-105 text-center shadow-lg"
              >
                {brandConfig.hero.cta.primary.text}
              </a>
              <a
                href={brandConfig.hero.cta.secondary.link}
                className="px-8 py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all text-center shadow-lg"
                style={{
                  background: '#0d9488',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(13,148,136,0.4)'
                }}
              >
                {brandConfig.hero.cta.secondary.text}
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 animate-fade-in-up" style={{ animationDelay: '2.4s' }}>
              <div className="flex items-center gap-2" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <CheckCircle2 className="w-5 h-5 text-cyan-300" />
                <span className="text-sm md:text-base">Truy xuất 100%</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <Snowflake className="w-5 h-5 text-cyan-300" />
                <span className="text-sm md:text-base">Tươi &lt;30 phút</span>
              </div>
              <div className="flex items-center gap-2" style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <Recycle className="w-5 h-5 text-cyan-300" />
                <span className="text-sm md:text-base">Bền vững</span>
              </div>
            </div>
          </div>

          {/* Right: Carousel */}
          <div className="lg:col-span-6">
            <HeroCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
