import { Container } from "../_components/Container";
import { SectionHeading } from "../_components/SectionHeading";
import { Card, CardContent } from "@shared/ui/card";
import { Icon } from "@shared/ui/icon";
import brandConfig from "@/config/brand.json";

const processSteps = brandConfig.sustainability.processSteps;

const commitments = brandConfig.sustainability.commitments;

const certifications = brandConfig.sustainability.certifications;

export function SustainabilitySection() {
  return (
    <section id="sustainability" className="py-10 md:py-24 bg-white">
      <Container>
        <SectionHeading
          level="h2"
          showDecorator
          decoratorColor="crystal"
          subtitle={brandConfig.sustainability.subtitle}
        >
          {brandConfig.sustainability.title}
        </SectionHeading>

        {/* Process Timeline */}
        <div className="hidden lg:block mt-16  bg-linear-to-br from-brand-sand/50 to-white rounded-2xl p-8 md:p-12 max-w-5xl mx-auto">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => {
              return (
                <div key={index} className="relative">
                  {/* Step Content */}
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-crystal/10">
                      <Icon type={step.icon} className="w-8 h-8 text-brand-crystal" />
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
                    <>
                      <div className="md:hidden flex justify-center mt-6 mb-2">
                        <div className="text-brand-crystal text-2xl">↓</div>
                      </div>
                      <div className="hidden lg:block absolute top-8 -right-4 text-brand-crystal text-2xl">
                        →
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Commitments */}
        <div className="mt-12">
          <h3 className="text-3xl font-bold text-brand-charcoal text-center mb-12">
            Cam kết của chúng tôi
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 ">
            {commitments.map((commitment, index) => {
              return (
                <Card
                  key={index}
                  className="group text-left hover:shadow-lg transition-shadow border-2 border-gray-200 py-1"
                >
                  <CardContent className="py-4 px-3">
                    {/* Icon và Title cùng hàng */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`shrink-0 inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full group-hover:scale-110 transition-transform ${commitment.icon ? 'bg-gray-50' : 'bg-gray-100'}`}>
                        <Icon type={commitment.icon} className="w-6 h-6 md:w-7 md:h-7 text-gray-600" />
                      </div>
                      <h4 className="text-xl md:text-xl lg:text-xl font-bold text-brand-charcoal uppercase">
                        {commitment.title}
                      </h4>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed">
                      {commitment.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Certification Path */}
        {/* <div className="mt-20 bg-linear-to-r from-brand-sand/50 to-white border-l-4 border-brand-crystal rounded-r-xl p-8 md:p-12">
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
                <div className="shrink-0 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
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
        </div> */}

        {/* Data Transparency (Optional) */}
        {/* <div className="mt-16 bg-brand-crystal/10 rounded-xl p-8 md:p-12 border-2 border-brand-crystal/20">
          <div className="flex items-start gap-6">
            <div className="shrink-0">
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
