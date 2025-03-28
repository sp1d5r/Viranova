import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-slate-50 dark:hover:bg-red-900/90",
        outline: "border border-slate-300 bg-white hover:bg-slate-200 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-800/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50",
        link: "text-slate-900 underline-offset-4 hover:underline dark:text-slate-50",
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
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  cooldown?: number // cooldown in seconds
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, cooldown, onClick, ...props }, ref) => {
    const [isDisabled, setIsDisabled] = React.useState(false);

    const Comp = asChild ? Slot : "button"

    const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (onClick) onClick(event);
      if (cooldown) {
        setIsDisabled(true);
        setTimeout(() => {
          setIsDisabled(false);
        }, cooldown * 1000);
      }
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        disabled={isDisabled || props.disabled}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
