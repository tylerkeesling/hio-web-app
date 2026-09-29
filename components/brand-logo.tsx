import { brand } from "@/lib/brand"
import { cn } from "@/lib/utils"

type MarkProps = React.SVGAttributes<SVGElement>

// Isometric cube: three faces with a hairline gap, echoing the hero illustration
export function BrandMark({ className, ...props }: MarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-7 shrink-0", className)}
      strokeLinejoin="round"
      strokeWidth={1.2}
      {...props}
    >
      <polygon
        points="16,2.98 26.42,9 16,15.02 5.58,9"
        fill="#7fdcf7"
        stroke="#7fdcf7"
      />
      <polygon
        points="4.73,10.47 15.15,16.49 15.15,28.53 4.73,22.51"
        fill="#0278d5"
        stroke="#0278d5"
      />
      <polygon
        points="16.85,16.49 27.27,10.47 27.27,22.51 16.85,28.53"
        fill="#00ade4"
        stroke="#00ade4"
      />
    </svg>
  )
}

export function BrandLogo({
  className,
  markClassName,
}: {
  className?: string
  markClassName?: string
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark className={markClassName} />
      <span className="text-[1.35rem] leading-none font-semibold tracking-[-0.04em] lowercase">
        {brand.name}
      </span>
    </span>
  )
}
