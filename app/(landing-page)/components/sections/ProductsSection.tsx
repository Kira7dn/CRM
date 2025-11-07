"use client";

import * as React from "react";
import Image from "next/image";
import { Container } from "../ui/Container";
import { SectionHeading } from "../ui/SectionHeading";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "@shared/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@shared/ui/carousel";
import { ShoppingCart, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  image: string;
  badge?: "new" | "bestseller" | "premium";
  rating: number;
  reviews: number;
}

const products: Product[] = [
  {
    id: "1",
    name: "Chả mực mai",
    price: "400.000đ",
    originalPrice: "450.000đ",
    image: "/products/chamuc.png",
    badge: "bestseller",
    rating: 4.9,
    reviews: 127,
  },
  {
    id: "2",
    name: "Bề bề",
    price: "380.000đ",
    image: "/products/bebe.png",
    badge: "new",
    rating: 4.8,
    reviews: 89,
  },
  {
    id: "3",
    name: "Hải sâm",
    price: "220.000đ",
    image: "/products/haisam.png",
    badge: "premium",
    rating: 4.7,
    reviews: 156,
  },
  {
    id: "4",
    name: "Mực Ống",
    price: "180.000đ",
    image: "/products/muc-ong.png",
    rating: 4.9,
    reviews: 203,
  },
  {
    id: "5",
    name: "Mực Lá",
    price: "180.000đ",
    image: "/products/muc-la.png",
    rating: 4.9,
    reviews: 203,
  },
];

export function ProductsSection() {
  return (
    <section className="py-20 md:py-32 bg-brand-sand">
      <Container>
        <SectionHeading
          level="h2"
          showDecorator
          decoratorColor="golden"
          subtitle="Hải sản tươi sống, đánh bắt hàng ngày từ vùng biển lạnh Cô Tô"
        >
          Sản Phẩm Nổi Bật
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
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card variant="shadowed" padding="none" hover="lift" className="overflow-hidden">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {/* Badge */}
                      {product.badge && (
                        <div className="absolute top-4 right-4">
                          <Badge variant={product.badge} size="sm">
                            {product.badge === "bestseller" && "Bán chạy"}
                            {product.badge === "new" && "Mới"}
                            {product.badge === "premium" && "Cao cấp"}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-6 space-y-4">
                      {/* Rating */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-brand-golden text-brand-golden" />
                          <span className="font-semibold text-sm">{product.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">({product.reviews} đánh giá)</span>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-bold text-lg text-brand-charcoal line-clamp-2">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-brand-crystal">
                          {product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            {product.originalPrice}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <Button className="w-full bg-brand-golden text-brand-charcoal hover:bg-brand-golden/90">
                        <ShoppingCart className="w-4 h-4" />
                        Thêm vào giỏ
                      </Button>
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
