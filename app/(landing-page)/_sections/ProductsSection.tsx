"use client";

import * as React from "react";
import Image from "next/image";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Card, CardContent } from "@shared/ui/card";
import { Badge } from "../ui/Badge";
import { Button } from "@shared/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@shared/ui/carousel";
import { ShoppingCart, Star } from "lucide-react";
import brandConfig from "@/config/brand.json";

interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  badge?: string;
  rating: number;
  reviews: number;
}

const products: Product[] = brandConfig.products.featured;

export function ProductsSection() {
  return (
    <section className="py-10 md:py-24 bg-brand-crystal">
      <Container>
        <SectionHeading
          level="h2"
          showDecorator
          decoratorColor="golden"
          subtitle="Hải sản tươi sống, đánh bắt hàng ngày từ vùng biển lạnh Cô Tô"
        >
          {brandConfig.products.title}
        </SectionHeading>

        <div className="mt-8">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow relative pt-0 pb-0">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100 group/image">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

                      {/* Badge */}
                      {product.badge && (
                        <div className="absolute top-4 right-4 z-10">
                          <Badge variant={product.badge as any} size="sm">
                            {product.badge === "bestseller" && "Bán chạy"}
                            {product.badge === "new" && "Mới"}
                            {product.badge === "premium" && "Cao cấp"}
                          </Badge>
                        </div>
                      )}

                      {/* Add to Cart Button - Center Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center md:opacity-0 md:group-hover/image:md:opacity-100 transition-opacity duration-300">
                        <Button className="bg-brand-golden text-brand-charcoal hover:bg-brand-golden/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform">
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          Thêm vào giỏ
                        </Button>
                      </div>

                      {/* Product Info Overlay - Always visible on mobile, fade on desktop hover */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 text-white md:group-hover/image:md:opacity-50 transition-opacity duration-300">
                        {/* Product Name */}
                        <h3 className="font-bold text-lg line-clamp-2 drop-shadow-lg">
                          {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-sm">{product.rating}</span>
                          </div>
                          <span className="text-sm text-white/80">({product.reviews} đánh giá)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-white drop-shadow-lg">
                            {product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-white/70 line-through drop-shadow">
                              {product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-2 border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white">
            Xem tất cả sản phẩm →
          </Button>
        </div>
      </Container>
    </section>
  );
}
