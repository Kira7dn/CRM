import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/app/(features)/crm/marketing/posts/_components/scheduler/utils";

const containerVariants = cva(
  "mx-auto w-full",
  {
    variants: {
      size: {
        full: "max-w-full",
        default: "max-w-[1200px]",
        text: "max-w-[720px]",
      },
      padding: {
        none: "px-0",
        sm: "px-4 md:px-6",
        default: "px-6 md:px-12 lg:px-16",
        lg: "px-8 md:px-16 lg:px-24",
      },
    },
    defaultVariants: {
      size: "default",
      padding: "default",
    },
  }
);

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof containerVariants> {
  as?: React.ElementType;
}

export function Container({
  className,
  size,
  padding,
  as: Component = "div",
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn(containerVariants({ size, padding, className }))}
      {...props}
    />
  );
}

export { containerVariants };
