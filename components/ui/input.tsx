import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "border-field-border bg-field text-foreground file:bg-field placeholder:text-muted-foreground/80 hover:border-foreground/25 focus-visible:border-brand focus-visible:ring-brand/15 flex h-10 w-full rounded-md border px-3 py-1 text-sm shadow-[0_1px_2px_rgb(20_18_11/0.03)] transition-[border-color,box-shadow] file:border-0 file:text-sm file:font-medium focus-visible:ring-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
