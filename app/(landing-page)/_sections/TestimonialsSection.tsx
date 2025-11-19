"use client";

import * as React from "react";
import Image from "next/image";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Card, CardContent } from "@shared/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@shared/ui/carousel";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  comment: string;
  date: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Nguyễn Thị Lan",
    avatar: "/avatar.jpg",
    location: "Hà Nội",
    rating: 5,
    comment: "Hải sản tươi ngon, đóng gói cẩn thận. Đặc biệt là tôm hùm, vị ngọt tự nhiên không cần nêm nhiều gia vị. Sẽ ủng hộ dài dài!",
    date: "2 tuần trước",
  },
  {
    id: "2",
    name: "Trần Văn Minh",
    avatar: "/avatar.jpg",
    location: "TP.HCM",
    rating: 5,
    comment: "Rất ấn tượng với hệ thống truy xuất nguồn gốc. Quét QR là biết ngay hải sản được đánh bắt ở đâu, khi nào. Yên tâm cho cả nhà!",
    date: "1 tháng trước",
  },
  {
    id: "3",
    name: "Phạm Hoài Thu",
    avatar: "/avatar.jpg",
    location: "Đà Nẵng",
    rating: 5,
    comment: "Giao hàng nhanh, hải sản vẫn tươi như vừa mới đánh bắt. Giá cả hợp lý so với chất lượng. Cảm ơn team Ngày Mới!",
    date: "3 tuần trước",
  },
  {
    id: "4",
    name: "Lê Quang Huy",
    avatar: "/avatar.jpg",
    location: "Hải Phòng",
    rating: 5,
    comment: "Là người địa phương biển nhưng vẫn phải công nhận hải sản Cô Tô có gì đó khác biệt. Thịt chắc, ngọt tự nhiên, không tanh.",
    date: "1 tuần trước",
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 md:py-32 bg-white">
      <Container>
        <SectionHeading
          level="h2"
          showDecorator
          decoratorColor="golden"
          subtitle="Hơn 10,000+ khách hàng hài lòng trên toàn quốc"
        >
          Khách hàng nói gì về chúng tôi?
        </SectionHeading>

        <div className="mt-16">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      {/* Quote Icon */}
                      <div className="text-brand-crystal/20 mb-4">
                        <Quote className="w-12 h-12" />
                      </div>

                      {/* Rating */}
                      <div className="flex gap-1 mb-4">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-brand-golden text-brand-golden"
                          />
                        ))}
                      </div>

                      {/* Comment */}
                      <p className="text-gray-700 leading-relaxed mb-6 line-clamp-4">
                        "{testimonial.comment}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                          <Image
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-brand-charcoal">
                            {testimonial.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{testimonial.location}</span>
                            <span>•</span>
                            <span>{testimonial.date}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-200">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-brand-crystal mb-2">
              10K+
            </div>
            <div className="text-gray-600">Khách hàng</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-brand-crystal mb-2">
              4.9
            </div>
            <div className="text-gray-600">Đánh giá TB</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-brand-crystal mb-2">
              98%
            </div>
            <div className="text-gray-600">Hài lòng</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-brand-crystal mb-2">
              24h
            </div>
            <div className="text-gray-600">Giao hàng</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
