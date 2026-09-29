import { readFileSync } from "node:fs"
import path from "node:path"

import { cn } from "@/lib/utils"

// Inlined (not <img>) so the dark theme can recolor it via the --cube-*, --belay-*
// and --belayer-* variables. The animated variant carries its own CSS animation;
// the static hero-cubes.svg is what the Universal Login page template embeds.
// Read per render so a regenerated SVG shows up without restarting the dev server.
function readIllustration() {
  return readFileSync(
    path.join(process.cwd(), "public/brand/hero-cubes-animated.svg"),
    "utf8"
  )
}

export function HeroIllustration({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("[&>svg]:h-auto [&>svg]:w-full", className)}
      dangerouslySetInnerHTML={{ __html: readIllustration() }}
    />
  )
}
