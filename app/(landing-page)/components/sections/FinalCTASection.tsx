import * as React from "react";
import { Container } from "../ui/Container";
import { Button } from "@shared/ui/button";
import { CheckCircle2, Phone, Mail } from "lucide-react";

export function FinalCTASection() {
  return (
    <section id="contact" className="py-20 md:py-32 bg-gradient-to-br from-brand-crystal to-blue-600 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Heading */}
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Sẵn sàng trải nghiệm hương vị biển Bắc?
            </h2>
            <p className="text-xl md:text-2xl text-white/90">
              Đặt hàng ngay hôm nay và nhận ưu đãi 15% cho đơn đầu tiên
            </p>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6 py-8">
            <div className="flex items-center gap-2 text-white/90">
              <CheckCircle2 className="w-5 h-5" />
              <span>Miễn phí giao hàng</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <CheckCircle2 className="w-5 h-5" />
              <span>Cam kết hoàn tiền 100%</span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <CheckCircle2 className="w-5 h-5" />
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-brand-golden text-brand-charcoal hover:bg-brand-golden/90 shadow-2xl font-bold px-10 py-7 text-lg"
            >
              Mua ngay - Giảm 15% →
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-primary hover:bg-white/20 backdrop-blur-sm font-semibold px-10 py-7 text-lg"
            >
              Liên hệ tư vấn
            </Button>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 pt-8 border-t border-white/20">
            <a
              href="tel:1900xxxx"
              className="flex items-center gap-2 text-white hover:text-brand-golden transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span className="font-semibold">1900 xxxx</span>
            </a>
            <a
              href="mailto:hello@ngaymoi-coto.vn"
              className="flex items-center gap-2 text-white hover:text-brand-golden transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span className="font-semibold">hello@ngaymoi-coto.vn</span>
            </a>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-white/70 pt-4">
            Hơn 10,000+ khách hàng tin tưởng • Đánh giá 4.9/5.0 ⭐
          </p>
        </div>
      </Container>
    </section>
  );
}
