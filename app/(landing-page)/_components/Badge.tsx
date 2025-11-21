import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@shared/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full font-semibold transition-all",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        primary: "bg-brand-crystal text-white",
        golden: "bg-brand-golden text-brand-charcoal",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        outline: "border-2 border-gray-300 text-gray-700 bg-transparent",
        new: "bg-linear-to-r from-brand-crystal to-blue-500 text-white",
        premium: "bg-linear-to-r from-brand-golden to-yellow-500 text-brand-charcoal",
        bestseller: "bg-linear-to-r from-orange-500 to-red-500 text-white",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        default: "text-sm px-3 py-1",
        lg: "text-base px-4 py-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
  VariantProps<typeof badgeVariants> { }

export function Badge({
  className,
  variant,
  size,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { badgeVariants };
