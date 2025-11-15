"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function HeroCarousel() {
  const [isMuted, setIsMuted] = useState(true);
  const videoItem = {
    type: 'video',
    src: 'https://haisanngaymoi.s3.ap-southeast-1.amazonaws.com/1115.mp4',
    alt: 'Video giới thiệu hải sản tươi ngon',
    description: 'Khám phá quy trình cung cấp hải sản tươi sống từ biển đến bàn ăn'
  };

  return (
    <div className="relative">
      <div className="relative aspect-video rounded-2xl overflow-hidden">
        <video
          src={videoItem.src}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover"
          aria-label={videoItem.alt}
        />
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
          aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  );
}
