import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ss text-sm font-medium shadow-sm transition duration-150 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow-sm hover:bg-primary/90 active:translate-y-px",
        ghost: "shadow-none text-muted hover:bg-lavender hover:text-foreground",
        outline: "border border-line bg-surface text-foreground shadow-none hover:bg-surface-2",
        subtle: "bg-lavender text-primary shadow-none hover:bg-lavender/80",
        secondary: "bg-foreground text-white shadow-sm hover:bg-foreground/90",
        danger: "bg-danger text-white shadow-sm hover:bg-danger/90",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
