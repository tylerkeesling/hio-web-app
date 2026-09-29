"use client"

import React, { useEffect, useState } from "react"
// import "@auth0/universal-components-react/styles"
import { Auth0ComponentProvider } from "@auth0/universal-components-react/rwa"
import { useTheme } from "next-themes"

interface ClientProviderProps {
  children: React.ReactNode
}

export function ClientProvider({ children }: ClientProviderProps) {
  const { resolvedTheme } = useTheme()
  // The theme is unknown during SSR; render "light" until mounted so the
  // components' wrapper class matches the server HTML (avoids a hydration error)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <Auth0ComponentProvider
      mode="proxy"
      proxyConfig={{
        baseUrl: "/",
      }}
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
      themeSettings={{
        mode: mounted && resolvedTheme === "dark" ? "dark" : "light",
        theme: "default",
      }}
    >
      {children}
    </Auth0ComponentProvider>
  )
}
