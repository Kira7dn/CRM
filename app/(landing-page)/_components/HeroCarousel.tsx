"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import brandConfig from "@/config/brand.json";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@shared/ui/carousel";

export default function HeroCarousel() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = brandConfig.hero.carousel;

  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => {
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };

    handleSelect();
    carouselApi.on("select", handleSelect);
    carouselApi.on("reInit", handleSelect);

    return () => {
      carouselApi.off("select", handleSelect);
      carouselApi.off("reInit", handleSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi || heroImages.length <= 1) return;

    const autoplay = setInterval(() => {
      carouselApi.scrollNext();
    }, 5000);

    return () => clearInterval(autoplay);
  }, [carouselApi]);

  return (
    <div className="relative">
      <Carousel
        setApi={setCarouselApi}
        opts={{ loop: true, align: "start" }}
        className="relative"
      >
        <CarouselContent className="ml-0">
          {heroImages.map((image, index) => (
            <CarouselItem key={image.src} className="pl-0">
              <div className="relative h-[367px] sm:h-[428px] md:h-[530px]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="100vw"
                  className="rounded-2xl object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 rounded-2xl bg-linear-to-t from-black/80 via-blue-900/40 to-transparent" />
                {/* Description overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-lg md:text-xl font-bold mb-2 drop-shadow-lg">
                    {image.alt}
                  </h3>
                  <p className="text-sm md:text-base opacity-90 drop-shadow-md">
                    {image.description}
                  </p>
                </div>
                {/* Navigation buttons overlay */}
                <CarouselPrevious
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 border-none bg-white/20 text-white hover:bg-white/30 h-12 w-12"
                  aria-label="Ảnh trước"
                />
                <CarouselNext
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 border-none bg-white/20 text-white hover:bg-white/30 h-12 w-12"
                  aria-label="Ảnh tiếp theo"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Navigation buttons now inside overlay */}
      </Carousel>
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {heroImages.map((image, index) => (
          <button
            key={`hero-dot-${image.src}`}
            onClick={() => carouselApi?.scrollTo(index)}
            className={`h-2.5 rounded-full transition-all ${currentSlide === index ? "w-6 bg-white" : "w-2.5 bg-white/50"
              }`}
            aria-label={`Chuyển đến ảnh ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
