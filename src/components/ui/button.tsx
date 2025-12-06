import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded border text-sm font-medium transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus:outline-none focus:ring-1 focus:ring-red-500",
  {
    variants: {
      variant: {
        default: "border-transparent bg-red-500/70 text-white hover:bg-red-600",
        destructive:
          "bg-red-500/70 text-white hover:bg-red-600 border-transparent",
        outline: "border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
        secondary:
          "border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost:
          "border-transparent bg-transparent text-gray-300 hover:text-gray-900 hover:bg-gray-100",
        link: "border-transparent text-red-500 underline-offset-4 hover:text-red-600 hover:underline focus:ring-0",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 gap-1.5 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
