import * as React from "react"

import { cn } from "../../utils/cn"
import {ChevronDown, ChevronUp} from "lucide-react";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg bg-white text-slate-950 shadow-sm dark:bg-neutral-900 dark:text-slate-50",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-slate-500 dark:text-slate-400", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

const CollapsibleCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}
>(({ className, children, collapsible = true, defaultCollapsed = false, ...props }, ref) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  if (!collapsible) {
    return (
      <Card className={className} {...props} ref={ref}>
        {children}
      </Card>
    );
  }

  return (
    <Card className={className} {...props} ref={ref}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === CardHeader) {
          return React.cloneElement(child as React.ReactElement<any>, {
            className: cn(child.props.className, "cursor-pointer"),
            onClick: () => setIsCollapsed(!isCollapsed),
            children: (
              <>
                {child.props.children}
                <button className="ml-auto">
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </button>
              </>
            ),
          });
        }
        if (React.isValidElement(child) && (child.type === CardContent || child.type === CardFooter)) {
          return isCollapsed ? null : child;
        }
        return child;
      })}
    </Card>
  );
});
CollapsibleCard.displayName = "CollapsibleCard";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CollapsibleCard }
