import { Suspense } from "react"

export default async function ErrorLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <Suspense>
      <main className="min-h-screen">{children}</main>
    </Suspense>
  )
}
