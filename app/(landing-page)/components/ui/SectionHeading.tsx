import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@shared/utils";

const headingVariants = cva(
  "font-bold tracking-tight",
  {
    variants: {
      level: {
        h1: "text-5xl md:text-6xl lg:text-7xl", // 48-56px desktop, 32-36px mobile
        h2: "text-4xl md:text-5xl lg:text-6xl", // 36-40px desktop, 24-28px mobile
        h3: "text-3xl md:text-4xl lg:text-5xl", // 28-32px desktop, 20-22px mobile
        h4: "text-2xl md:text-3xl lg:text-4xl", // 24px desktop, 18px mobile
      },
      color: {
        default: "text-brand-charcoal",
        white: "text-white",
        crystal: "text-brand-crystal",
        golden: "text-brand-golden",
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
      },
    },
    defaultVariants: {
      level: "h2",
      color: "default",
      align: "center",
    },
  }
);

const subtitleVariants = cva(
  "font-normal mt-3 md:mt-4",
  {
    variants: {
      size: {
        default: "text-base md:text-lg", // 16-18px
        large: "text-lg md:text-xl",     // 18-20px
      },
      color: {
        default: "text-gray-600",
        white: "text-white/90",
        muted: "text-gray-500",
      },
    },
    defaultVariants: {
      size: "default",
      color: "default",
    },
  }
);

export interface SectionHeadingProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, "color">,
    VariantProps<typeof headingVariants> {
  subtitle?: string;
  subtitleSize?: VariantProps<typeof subtitleVariants>["size"];
  subtitleColor?: VariantProps<typeof subtitleVariants>["color"];
  showDecorator?: boolean;
  decoratorColor?: "crystal" | "golden";
}

export function SectionHeading({
  className,
  level = "h2",
  color,
  align,
  subtitle,
  subtitleSize,
  subtitleColor,
  showDecorator = false,
  decoratorColor = "crystal",
  children,
  ...props
}: SectionHeadingProps) {
  const Component = level as React.ElementType;

  return (
    <div className={cn("space-y-3 md:space-y-4", align === "center" && "text-center", align === "left" && "text-left", align === "right" && "text-right")}>
      {showDecorator && (
        <div className={cn(
          "w-16 h-1 rounded-full mb-4",
          align === "center" && "mx-auto",
          align === "right" && "ml-auto",
          decoratorColor === "crystal" ? "bg-brand-crystal" : "bg-brand-golden"
        )} />
      )}
      <Component
        className={cn(headingVariants({ level, color, align, className }))}
        {...props}
      >
        {children}
      </Component>
      {subtitle && (
        <p className={cn(subtitleVariants({ size: subtitleSize, color: subtitleColor }))}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export { headingVariants, subtitleVariants };
