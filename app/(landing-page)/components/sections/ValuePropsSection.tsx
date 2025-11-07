import * as React from "react";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Card } from "../ui/Card";
import { QrCode, Sparkles, Heart, ArrowRight } from "lucide-react";

const valueProps = [
  {
    icon: QrCode,
    title: "MINH BẠCH 100%",
    description:
      "Mỗi sản phẩm có mã truy xuất QR. Biết rõ nguồn gốc, ngày đánh bắt, và hành trình từ biển đến tay bạn.",
    link: "#traceability",
    color: "text-brand-crystal" as const,
    bgColor: "bg-brand-crystal/10" as const,
  },
  {
    icon: Sparkles,
    title: "HƯƠNG VỊ ĐẶC BIỆT",
    description:
      "Biển lạnh Cô Tô tạo nên vị ngọt tự nhiên đặc trưng. Hải sản phát triển chậm, thịt chắc, dinh dưỡng cao.",
    link: "#coto-story",
    color: "text-brand-golden" as const,
    bgColor: "bg-brand-golden/10" as const,
  },
  {
    icon: Heart,
    title: "TÁC ĐỘNG TÍCH CỰC",
    description:
      "1% doanh thu cho Quỹ Biển Sạch. Hỗ trợ ngư dân địa phương. Cam kết đánh bắt bền vững.",
    link: "#csr",
    color: "text-red-500" as const,
    bgColor: "bg-red-50" as const,
  },
];

export function ValuePropsSection() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <Container>
        <SectionHeading
          level="h2"
          showDecorator
          decoratorColor="crystal"
          subtitle="Ba trụ cột xây dựng niềm tin và sự khác biệt của Ngày Mới"
        >
          Tại sao chọn Ngày Mới - Cô Tô?
        </SectionHeading>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {valueProps.map((prop, index) => {
            const Icon = prop.icon;
            return (
              <Card
                key={index}
                variant="shadowed"
                hover="lift"
                className="group text-center"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full ${prop.bgColor} mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-8 h-8 md:w-10 md:h-10 ${prop.color}`} />
                </div>

                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-brand-charcoal mb-4">
                  {prop.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed mb-6">
                  {prop.description}
                </p>

                {/* Link */}
                <a
                  href={prop.link}
                  className={`inline-flex items-center gap-2 ${prop.color} font-medium hover:gap-3 transition-all`}
                >
                  Tìm hiểu thêm
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
