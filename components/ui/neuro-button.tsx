import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const neuroButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "neuro bg-primary text-primary-foreground hover:bg-primary/90 active:neuro-inset",
        glass: "glass-card text-foreground hover:bg-white/10 active:neuro-inset",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground neuro",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface NeuroButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neuroButtonVariants> {
  asChild?: boolean
}

const NeuroButton = React.forwardRef<HTMLButtonElement, NeuroButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(neuroButtonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
NeuroButton.displayName = "NeuroButton"

export { NeuroButton, neuroButtonVariants }
