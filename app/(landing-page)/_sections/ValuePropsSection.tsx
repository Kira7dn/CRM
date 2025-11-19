import * as React from "react";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Card, CardContent } from "@shared/ui/card";
import { ArrowRight } from "lucide-react";
import { Icon } from "@shared/ui/icon";
import brandConfig from "@/config/brand.json";

const valueProps = brandConfig.valueProps.items;

export function ValuePropsSection() {
  return (
    <section className="py-10 md:py-24 bg-white">
      <Container>
        <SectionHeading
          level="h2"
          showDecorator
          decoratorColor="crystal"
          subtitle="Ba trụ cột xây dựng niềm tin và sự khác biệt của Ngày Mới"
        >
          {brandConfig.valueProps.title}
        </SectionHeading>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {valueProps.map((prop, index) => {
            return (
              <Card
                key={index}
                className="group text-left hover:shadow-lg transition-shadow py-4"
              >
                <CardContent className="py-0 px-3">
                  {/* Icon và Title cùng hàng */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`shrink-0 inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full group-hover:scale-110 transition-transform ${prop.bgColor}`}>
                      <Icon type={prop.icon} className={`w-6 h-6 md:w-7 md:h-7 ${prop.iconColor}`} />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-brand-charcoal">
                      {prop.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {prop.description}
                  </p>

                  {/* Link */}
                  <a
                    href={prop.link}
                    className={`inline-flex items-center gap-2 ${prop.color} font-medium hover:gap-3 transition-all text-sm`}
                  >
                    Tìm hiểu thêm
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
