import { NextRequest, NextResponse } from "next/server"

import { DEMO_CONTROLS_COOKIE, demoControlsToken } from "@/lib/demo-controls"

/**
 * Unlocks the landing page's demo controls in this browser. Open
 * /demo?key=<DEMO_CONTROLS_KEY> once before the demo; /demo?lock hides them again.
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/", request.url))

  if (request.nextUrl.searchParams.has("lock")) {
    response.cookies.delete(DEMO_CONTROLS_COOKIE)
    return response
  }

  const token = demoControlsToken(request.nextUrl.searchParams.get("key"))
  if (!token) {
    return new Response("Not found", { status: 404 })
  }

  response.cookies.set(DEMO_CONTROLS_COOKIE, token, {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
