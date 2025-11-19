import * as React from "react";
import Image from "next/image";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Card, CardContent } from "@shared/ui/card";
import { AnimatedCounter } from "../ui/AnimatedCounter";
import { Users, Heart, Trees, GraduationCap } from "lucide-react";

const impacts = [
  {
    icon: Heart,
    value: 500,
    suffix: " triệu",
    label: "Đóng góp Quỹ Biển Sạch",
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    icon: Users,
    value: 150,
    suffix: "+",
    label: "Ngư dân được hỗ trợ",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Trees,
    value: 10000,
    suffix: " kg",
    label: "Rác biển thu gom",
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    icon: GraduationCap,
    value: 200,
    suffix: "+",
    label: "Trẻ em được học bổng",
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
];

export function CSRSection() {
  return (
    <section id="csr" className="py-10 md:py-24 bg-linear-to-b from-brand-sand to-white">
      <Container>
        <SectionHeading
          level="h2"
          showDecorator
          decoratorColor="crystal"
          subtitle="1% doanh thu được dành cho các hoạt động bảo vệ môi trường biển và hỗ trợ cộng đồng"
        >
          Tác Động Xã Hội & Môi Trường
        </SectionHeading>

        {/* Impact Numbers */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16">
          {impacts.map((impact, index) => {
            const Icon = impact.icon;
            return (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${impact.bgColor} mb-4`}>
                    <Icon className={`w-8 h-8 ${impact.color}`} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-brand-charcoal mb-2">
                    <AnimatedCounter
                      value={impact.value}
                      suffix={impact.suffix}
                      duration={2500}
                      separator=","
                    />
                  </div>
                  <p className="text-gray-600 font-medium">{impact.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div> */}

        {/* Story Section */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-4/3 rounded-lg overflow-hidden">
            <Image
              src="/coto/nguoi-dan-coto.jpg"
              alt="Cộng đồng ngư dân Cô Tô"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-6">
            <h3 className="text-3xl md:text-4xl font-bold text-brand-charcoal">
              Cùng nhau xây dựng cộng đồng bền vững
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              Chúng tôi tin rằng kinh doanh bền vững phải đi đôi với trách nhiệm xã hội.
              Mỗi sản phẩm bạn mua không chỉ mang đến hương vị tuyệt vời mà còn góp phần:
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-brand-crystal flex items-center justify-center text-white font-bold text-sm mt-0.5">
                  ✓
                </div>
                <span className="text-gray-700">
                  <strong>Bảo vệ biển:</strong> Thu gom rác thải, bảo vệ san hô và sinh vật biển
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-brand-crystal flex items-center justify-center text-white font-bold text-sm mt-0.5">
                  ✓
                </div>
                <span className="text-gray-700">
                  <strong>Hỗ trợ ngư dân:</strong> Giá thu mua công bằng, đào tạo kỹ năng bền vững
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="shrink-0 w-6 h-6 rounded-full bg-brand-crystal flex items-center justify-center text-white font-bold text-sm mt-0.5">
                  ✓
                </div>
                <span className="text-gray-700">
                  <strong>Giáo dục trẻ em:</strong> Học bổng cho con em ngư dân nghèo
                </span>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
