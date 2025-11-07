import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@shared/utils";

const cardVariants = cva(
  "rounded-lg transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-white",
        bordered: "bg-white border-2 border-gray-200",
        shadowed: "bg-white shadow-md hover:shadow-lg",
        elevated: "bg-white shadow-lg hover:shadow-xl",
        gradient: "bg-gradient-to-br from-brand-crystal/10 to-brand-golden/10",
        sand: "bg-brand-sand",
      },
      padding: {
        none: "p-0",
        sm: "p-4 md:p-6",
        default: "p-6 md:p-8",
        lg: "p-8 md:p-12",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1",
        scale: "hover:scale-[1.02]",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      hover: "none",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  as?: React.ElementType;
}

export function Card({
  className,
  variant,
  padding,
  hover,
  as: Component = "div",
  ...props
}: CardProps) {
  return (
    <Component
      className={cn(cardVariants({ variant, padding, hover, className }))}
      {...props}
    />
  );
}

export { cardVariants };
