"use client";

import { useState } from "react";

export default function HeroCarousel() {
  const [isMuted, setIsMuted] = useState(true);
  const videoItem = {
    type: 'video',
    src: '/1115.mp4',
    alt: 'Video giới thiệu hải sản tươi ngon',
    description: 'Khám phá quy trình cung cấp hải sản tươi sống từ biển đến bàn ăn'
  };

  return (
    <div className="relative">
      <div className="relative h-[367px] sm:h-[428px] md:h-[530px]">
        <video
          src={videoItem.src}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          className="w-full h-full rounded-2xl object-cover"
          aria-label={videoItem.alt}
        />
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
          aria-label="Bật âm thanh"
        >
          {isMuted ? '🔊' : '🔇'}
        </button>
      </div>
    </div>
  );
}
