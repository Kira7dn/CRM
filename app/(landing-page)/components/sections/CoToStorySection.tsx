import * as React from "react";
import Image from "next/image";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Card } from "../ui/Card";
import { Waves, Eye, Shell } from "lucide-react";

const characteristics = [
  {
    icon: Waves,
    value: "18-22°C",
    label: "Nước lạnh nhất VN",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Eye,
    value: "10-15m",
    label: "Độ trong vắt",
    color: "text-cyan-500",
    bgColor: "bg-cyan-50",
  },
  {
    icon: Shell,
    value: "Rạn san hô",
    label: "phong phú",
    color: "text-teal-500",
    bgColor: "bg-teal-50",
  },
];

const images = [
  {
    src: "/coto/ngudan.jpg",
    alt: "Ngư dân Cô Tô",
    caption: "Ngư dân địa phương",
  },
  // {
  //   src: "/coto/tau-danh-ca.png",
  //   alt: "Tàu cá Cô Tô",
  //   caption: "Đội tàu đánh bắt",
  // },
  {
    src: "/coto/sanho.webp",
    alt: "San hô Cô Tô",
    caption: "Rạn san hô phong phú",
  },
];

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

        {/* Heading on Image */}
        <div className="absolute inset-0 flex items-end">
          <Container className="pb-12 md:pb-16">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Cô Tô - Vùng biển lạnh phía Bắc
              </h2>
              <p className="text-lg md:text-xl text-brand-sand">
                Nơi hải lưu Bắc mang đến hương vị đặc biệt
              </p>
            </div>
          </Container>
        </div>
      </div>

      {/* Stats/Facts Bar */}
      <div className="bg-white border-b border-gray-200">
        <Container className="py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {characteristics.map((char, index) => {
              const Icon = char.icon;
              return (
                <Card
                  key={index}
                  variant="bordered"
                  className="text-center"
                >
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${char.bgColor} mb-4`}>
                    <Icon className={`w-8 h-8 ${char.color}`} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-brand-charcoal mb-2">
                    {char.value}
                  </div>
                  <p className="text-gray-600">{char.label}</p>
                </Card>
              );
            })}
          </div>
        </Container>
      </div>

      {/* Main Story Content */}
      <div className="py-20 md:py-32 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
            {/* Left: Text Content */}
            <div className="space-y-6 h-full">
              <h3 className="text-3xl md:text-4xl font-bold text-brand-charcoal">
                Tại sao Cô Tô đặc biệt?
              </h3>

              <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
                <p>
                  Cô Tô nằm ở cực Đông Bắc Việt Nam, là hòn đảo xa bờ nhất tỉnh Quảng Ninh.
                  Đây là nơi dòng hải lưu lạnh từ phía Bắc đi qua, mang theo nhiệt độ nước{" "}
                  <strong className="text-brand-crystal">18-22°C</strong> — lạnh nhất cả nước.
                </p>

                <p>
                  Nước lạnh khiến hải sản phát triển chậm hơn, tích lũy nhiều dưỡng chất,
                  tạo nên <strong>thịt chắc và vị ngọt thanh</strong> đặc trưng. Đó là lý do
                  tại sao cá, tôm, mực từ Cô Tô có hương vị khác biệt.
                </p>

                <p>
                  Vùng biển Cô Tô còn có độ trong vắt cao (10-15m), nền đáy cát - san hô
                  giàu khoáng chất, và dòng chảy mạnh giúp nước luôn tuần hoàn. Môi trường
                  tự nhiên thuần khiết này là{" "}
                  <strong className="text-brand-crystal">"bí mật"</strong> tạo nên hải sản cao cấp.
                </p>
              </div>

              {/* Quote */}
              <blockquote className="border-l-4 border-brand-crystal pl-6 py-4 bg-brand-sand/30 rounded-r-lg">
                <p className="text-lg italic text-gray-700 mb-2">
                  "Biển lạnh tạo nên hải sản chất lượng. Đó là lý do chúng tôi chọn Cô Tô."
                </p>
                <footer className="text-sm text-gray-600">
                  — Nguyễn Văn Hải, Thuyền trưởng 25 năm kinh nghiệm
                </footer>
              </blockquote>
            </div>

            {/* Right: Images Gallery */}
            <div className="grid grid-cols-1 gap-6 h-full overflow-y-auto">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="bg-linear-to-t from-transparent to-white/20 backdrop-blur-sm border border-white/20 rounded-lg p-6 group"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold">{image.caption}</p>
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
            fill="#F4EBDD"
          />
        </svg>
      </div>
    </section>
  );
}
