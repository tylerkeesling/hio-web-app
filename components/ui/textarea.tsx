import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "border-field-border bg-field placeholder:text-muted-foreground/80 focus-visible:border-brand focus-visible:ring-brand/15 flex min-h-[60px] w-full resize-none rounded-md border px-3 py-2 text-sm shadow-[0_1px_2px_rgb(20_18_11/0.03)] focus-visible:ring-4 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
