import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium gap-1 whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-navy text-white border-navy",
        outline: "bg-white text-foreground border-border",
        muted: "bg-muted-bg text-muted border-transparent",
        amber: "bg-amber-bg text-amber border-amber/30",
        red: "bg-red-bg text-red border-red/30",
        green: "bg-green-bg text-green border-green/30",
        navy: "bg-navy/10 text-navy border-navy/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
