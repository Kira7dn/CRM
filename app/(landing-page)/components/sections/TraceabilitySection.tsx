"use client";

import * as React from "react";
import Image from "next/image";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Card } from "../ui/Card";
import { QrCode, MapPin, Calendar, Ship, Thermometer, CheckCircle2 } from "lucide-react";

export function TraceabilitySection() {
  const [selectedStep, setSelectedStep] = React.useState(0);

  const traceSteps = [
    {
      icon: Ship,
      title: "Đánh bắt",
      location: "Vùng biển Cô Tô",
      date: "06:30 - 05/01/2025",
      detail: "Tàu cá CT-12345 đánh bắt tại tọa độ 21.1234, 107.7890",
    },
    {
      icon: Thermometer,
      title: "Bảo quản",
      location: "Kho lạnh Cô Tô",
      date: "08:00 - 05/01/2025",
      detail: "Bảo quản nhiệt độ -18°C, đạt chuẩn HACCP",
    },
    {
      icon: CheckCircle2,
      title: "Kiểm định",
      location: "Trung tâm QA",
      date: "10:30 - 05/01/2025",
      detail: "Kiểm tra chất lượng, an toàn thực phẩm",
    },
    {
      icon: MapPin,
      title: "Giao hàng",
      location: "Hà Nội",
      date: "18:00 - 05/01/2025",
      detail: "Giao đến tay khách hàng trong 24h",
    },
  ];

  return (
    <section id="traceability" className="py-20 md:py-32 bg-gradient-to-b from-white to-brand-sand/30">
      <Container>
        <SectionHeading
          level="h2"
          showDecorator
          decoratorColor="crystal"
          subtitle="Quét mã QR trên mỗi sản phẩm để biết toàn bộ hành trình từ biển đến bàn ăn"
        >
          Truy Xuất Nguồn Gốc 100%
        </SectionHeading>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: QR Demo */}
          <div className="order-2 lg:order-1">
            <Card variant="elevated" className="text-center">
              {/* QR Code */}
              <div className="inline-flex items-center justify-center w-48 h-48 bg-white rounded-lg border-4 border-brand-crystal/20 mx-auto mb-6">
                <QrCode className="w-40 h-40 text-brand-charcoal" />
              </div>

              <h3 className="text-2xl font-bold text-brand-charcoal mb-2">
                Quét để xem chi tiết
              </h3>
              <p className="text-gray-600 mb-6">
                Mỗi sản phẩm có mã QR riêng biệt
              </p>

              {/* Product Info */}
              <div className="bg-brand-sand/50 rounded-lg p-6 space-y-3 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mã sản phẩm:</span>
                  <span className="font-mono font-semibold">TH-050125-001</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sản phẩm:</span>
                  <span className="font-semibold">Tôm Hùm Cô Tô</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Trọng lượng:</span>
                  <span className="font-semibold">1.2 kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ngư dân:</span>
                  <span className="font-semibold">Nguyễn Văn A</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Trace Steps */}
          <div className="order-1 lg:order-2 space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold text-brand-charcoal mb-8">
              Hành trình minh bạch
            </h3>

            {traceSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = selectedStep === index;

              return (
                <Card
                  key={index}
                  variant={isActive ? "gradient" : "bordered"}
                  padding="sm"
                  hover="scale"
                  className={`cursor-pointer transition-all ${
                    isActive ? "border-brand-crystal shadow-md" : ""
                  }`}
                  onClick={() => setSelectedStep(index)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      isActive
                        ? "bg-brand-crystal text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-brand-charcoal">
                        {step.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {step.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {step.date}
                        </span>
                      </div>
                      {isActive && (
                        <p className="text-sm text-gray-700 mt-2 animate-[fade-in-up_0.3s_ease-out]">
                          {step.detail}
                        </p>
                      )}
                    </div>

                    {/* Step Number */}
                    <div className="flex-shrink-0 text-4xl font-bold text-gray-200">
                      {index + 1}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Trust Statement */}
        <div className="mt-16 text-center">
          <p className="text-xl md:text-2xl font-semibold text-brand-charcoal max-w-3xl mx-auto">
            Chúng tôi tin rằng{" "}
            <span className="text-brand-crystal">minh bạch</span> là nền tảng của{" "}
            <span className="text-brand-crystal">niềm tin</span>
          </p>
        </div>
      </Container>
    </section>
  );
}
