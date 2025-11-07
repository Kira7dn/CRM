import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "../ui/Container";
import brandConfig from "@/config/brand.json";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  company: [
    { label: "Về chúng tôi", href: "#about" },
    { label: "Câu chuyện Cô Tô", href: "#coto-story" },
    { label: "Bền vững", href: "#sustainability" },
    { label: "Tác động xã hội", href: "#csr" },
  ],
  products: [
    { label: "Tôm & Cua", href: "/products/shrimp" },
    { label: "Cá tươi", href: "/products/fish" },
    { label: "Hải sản khác", href: "/products/seafood" },
    { label: "Quà tặng", href: "/products/gifts" },
  ],
  support: [
    { label: "Câu hỏi thường gặp", href: "/faq" },
    { label: "Hướng dẫn đặt hàng", href: "/guide" },
    { label: "Chính sách giao hàng", href: "/shipping" },
    { label: "Chính sách đổi trả", href: "/returns" },
    { label: "Truy xuất nguồn gốc", href: "#traceability" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Newsletter Section */}
      <div className="bg-brand-sand py-12 md:py-16">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-brand-charcoal">
              Nhận tin từ Ngày Mới - Cô Tô
            </h3>
            <p className="text-gray-600">
              Ưu đãi đặc biệt • Công thức mới • Câu chuyện biển
            </p>

            <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Email của bạn..."
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-crystal focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-brand-crystal text-white font-semibold rounded-lg hover:bg-brand-crystal/90 transition-colors"
              >
                Đăng ký →
              </button>
            </form>

            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              Giảm 10% cho đơn đầu tiên khi đăng ký
            </p>
          </div>
        </Container>
      </div>

      {/* Main Footer */}
      <div className="py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Brand Column */}
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <Image
                  src={brandConfig.assets.logoFull}
                  alt={brandConfig.brand.shortName}
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <span className="font-bold text-xl text-brand-charcoal">
                  {brandConfig.brand.shortName}
                </span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Hải sản cao cấp từ biển Cô Tô. Minh bạch 100%, bền vững, và tác động tích cực.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-brand-crystal hover:text-white hover:scale-110 transition-all"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-bold text-sm text-brand-charcoal uppercase mb-4">
                Công ty
              </h4>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-brand-crystal transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products Links */}
            <div>
              <h4 className="font-bold text-sm text-brand-charcoal uppercase mb-4">
                Sản phẩm
              </h4>
              <ul className="space-y-2">
                {footerLinks.products.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-600 hover:text-brand-crystal transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 className="font-bold text-sm text-brand-charcoal uppercase mb-4">
                Liên hệ
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="tel:1900xxxx"
                    className="flex items-start gap-2 text-gray-600 hover:text-brand-crystal transition-colors"
                  >
                    <Phone className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>1900 xxxx</span>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:hello@ngaymoi-coto.vn"
                    className="flex items-start gap-2 text-gray-600 hover:text-brand-crystal transition-colors"
                  >
                    <Mail className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>hello@ngaymoi-coto.vn</span>
                  </a>
                </li>
                <li className="flex items-start gap-2 text-gray-600">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>Quảng Ninh, Việt Nam</span>
                </li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                Giờ làm việc:<br />
                8:00 - 20:00 (Hàng ngày)
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Bottom Bar */}
      <div className="bg-brand-charcoal py-6">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              © {currentYear} Ngày Mới - Cô Tô. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Chính sách bảo mật
              </Link>
              <span>|</span>
              <Link href="/terms" className="hover:text-white transition-colors">
                Điều khoản sử dụng
              </Link>
              <span>|</span>
              <Link href="/cookies" className="hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}

// Helper component for checkmark icon
function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
