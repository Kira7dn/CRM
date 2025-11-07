import * as React from "react";
import Image from "next/image";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Card } from "../ui/Card";
import { Ship, Snowflake, Truck, Package, CalendarX, Target, Leaf, BarChart3 } from "lucide-react";

const processSteps = [
  {
    icon: Ship,
    title: "KHAI THÁC",
    description: "Vùng được phê duyệt",
    details: ["Lưới chọn lọc", "Nhật ký điện tử"],
  },
  {
    icon: Snowflake,
    title: "LÀM LẠNH",
    description: "Trong 30 phút",
    details: ["Ice slurry system", "Nhiệt độ tự động"],
  },
  {
    icon: Truck,
    title: "VẬN CHUYỂN",
    description: "Cold chain -18°C",
    details: ["Không gián đoạn", "Tem kiểm soát"],
  },
  {
    icon: Package,
    title: "GIAO HÀNG",
    description: "Đến tay khách",
    details: ["Trong 24h", "Đóng gói sinh học"],
  },
];

const commitments = [
  {
    icon: CalendarX,
    title: "KHÔNG ĐÁNH BẮT",
    subtitle: "Mùa sinh sản",
    description:
      "Chúng tôi tuân thủ nghiêm ngặt lịch cấm đánh bắt để bảo vệ nguồn lợi hải sản cho thế hệ sau.",
    color: "text-red-500",
    borderColor: "border-red-200",
  },
  {
    icon: Target,
    title: "GIẢM BYCATCH",
    subtitle: "Mục tiêu <5%",
    description:
      "Sử dụng lưới chọn lọc và thả ngay cá non, loài cấm. Hiện tại bycatch chỉ 3.2%.",
    color: "text-blue-500",
    borderColor: "border-blue-200",
  },
  {
    icon: Leaf,
    title: "BẢO VỆ HỆ SINH THÁI",
    subtitle: "",
    description:
      "Không sử dụng phương thức đánh bắt phá hủy đáy biển. Tham gia phục hồi san hô.",
    color: "text-green-500",
    borderColor: "border-green-200",
  },
];

const certifications = [
  {
    name: "Marine Stewardship Council",
    abbr: "MSC",
    description: "Cho khai thác tự nhiên bền vững",
    logo: "/images/certifications/msc-logo.svg",
  },
  {
    name: "Aquaculture Stewardship Council",
    abbr: "ASC",
    description: "Cho nuôi trồng thủy sản có trách nhiệm",
    logo: "/images/certifications/asc-logo.svg",
  },
];

export function SustainabilitySection() {
  return (
    <section id="sustainability" className="py-20 md:py-32 bg-white">
      <Container>
        <SectionHeading
          level="h2"
          showDecorator
          decoratorColor="crystal"
          subtitle="Quy trình khai thác và bảo quản có trách nhiệm"
        >
          Bền vững từ biển đến bàn ăn
        </SectionHeading>

        {/* Process Timeline */}
        <div className="mt-16 bg-gradient-to-br from-brand-sand/50 to-white rounded-2xl p-8 md:p-12 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Step Content */}
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-crystal/10">
                      <Icon className="w-8 h-8 text-brand-crystal" />
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-brand-charcoal mb-1">
                        {step.title}
                      </h4>
                      <p className="font-semibold text-brand-crystal mb-3">
                        {step.description}
                      </p>
                      <div className="space-y-1">
                        {step.details.map((detail, idx) => (
                          <p key={idx} className="text-sm text-gray-600">
                            {detail}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Arrow (except last item on desktop) */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 -right-4 text-brand-crystal text-3xl">
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Commitments */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-brand-charcoal text-center mb-12">
            Cam kết của chúng tôi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {commitments.map((commitment, index) => {
              const Icon = commitment.icon;
              return (
                <Card
                  key={index}
                  variant="bordered"
                  hover="lift"
                  className={`border-2 ${commitment.borderColor}`}
                >
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-50">
                      <Icon className={`w-7 h-7 ${commitment.color}`} />
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-brand-charcoal uppercase">
                        {commitment.title}
                      </h4>
                      {commitment.subtitle && (
                        <p className={`text-base font-semibold ${commitment.color} mt-1`}>
                          {commitment.subtitle}
                        </p>
                      )}
                    </div>

                    <p className="text-gray-600 leading-relaxed">
                      {commitment.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Certification Path */}
        <div className="mt-20 bg-gradient-to-r from-brand-sand/50 to-white border-l-4 border-brand-crystal rounded-r-xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-brand-charcoal mb-6">
            Hướng tới chứng nhận quốc tế
          </h3>

          <p className="text-lg text-gray-700 mb-8">
            Chúng tôi đang trên hành trình đạt chứng nhận:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-start gap-6 p-6 bg-white rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  {/* Logo placeholder */}
                  <div className="text-gray-400 font-bold text-2xl">
                    {cert.abbr}
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-brand-charcoal mb-2">
                    {cert.name}
                  </h4>
                  <p className="text-sm text-gray-600">{cert.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
            <h5 className="font-semibold text-brand-charcoal mb-3 flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              Timeline
            </h5>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-brand-crystal mt-1">✓</span>
                <span>Hoàn thành pre-assessment trong 12 tháng</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-crystal mt-1">→</span>
                <span>Full certification trong 24-36 tháng</span>
              </li>
            </ul>
          </div> */}
        </div>

        {/* Data Transparency (Optional) */}
        {/* <div className="mt-16 bg-brand-crystal/10 rounded-xl p-8 md:p-12 border-2 border-brand-crystal/20">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-brand-crystal rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h4 className="text-2xl font-bold text-brand-charcoal mb-4">
                Minh bạch dữ liệu
              </h4>

              <p className="text-gray-700 mb-4">
                Chúng tôi công bố hàng tháng:
              </p>

              <ul className="space-y-2 text-gray-700 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-brand-crystal">•</span>
                  <span>Tổng sản lượng khai thác</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-crystal">•</span>
                  <span>Tỷ lệ bycatch (%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-crystal">•</span>
                  <span>Lượng nhiên liệu/kg hải sản</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-brand-crystal">•</span>
                  <span>Rác thải thu hồi từ biển</span>
                </li>
              </ul>

              <a
                href="#reports"
                className="inline-flex items-center gap-2 text-brand-crystal font-semibold hover:text-brand-crystal/80 transition-colors"
              >
                <span>Xem báo cáo tháng này</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div> */}
      </Container>
    </section>
  );
}
