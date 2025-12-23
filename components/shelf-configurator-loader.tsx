"use client"

import dynamic from "next/dynamic"

const ShelfConfigurator = dynamic(
  () => import("@/components/shelf-configurator").then((mod) => mod.ShelfConfigurator),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Konfigurator wird geladen...</p>
        </div>
      </div>
    ),
  },
)

export function ShelfConfiguratorLoader() {
  return <ShelfConfigurator />
}
