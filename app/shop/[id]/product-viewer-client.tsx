"use client"

import { useState } from "react"
import { Product3DViewer } from "@/components/product-3d-viewer"
import { ProductImageClient } from "./product-image-client"
import { Package, Rotate3D } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/simpli-products"

interface ProductViewerClientProps {
  product: {
    artNr: string
    name: string
    image?: string
    category?: string
    size?: number
    color?: string
  }
  priority?: boolean
  className?: string
}

export function ProductViewerClient({ product, priority, className }: ProductViewerClientProps) {
  const [view3D, setView3D] = useState(false)

  // Check if product has 3D model support (categories that have GLB files)
  const has3DSupport =
    product.category &&
    [
      "schublade",
      "einzelschublade",
      "tuer",
      "klapptuer",
      "flaechenset",
      "flaechenset-glas",
      "korpus",
    ].includes(product.category)

  // Convert to Product type for 3D viewer
  const productFor3D: Product = {
    artNr: product.artNr,
    name: product.name,
    category: product.category as any || "flaechenset",
    size: product.size || 80,
    price: 0,
    color: product.color as any,
    image: product.image,
  }

  return (
    <div className={className}>
      <div className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden relative">
        {view3D && has3DSupport ? (
          <div className="w-full h-full">
            <Product3DViewer product={productFor3D} className="w-full h-full" />
          </div>
        ) : product.image ? (
          <ProductImageClient
            artNr={product.artNr}
            defaultImage={product.image}
            productName={product.name}
            priority={priority}
          />
        ) : (
          <Package className="w-32 h-32 text-gray-300" />
        )}

        {/* 3D View Toggle Button */}
        {has3DSupport && (
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView3D(!view3D)}
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
            >
              <Rotate3D className="w-4 h-4 mr-2" />
              {view3D ? "2D" : "3D"}
            </Button>
          </div>
        )}
      </div>

      {/* Info text about 3D view */}
      {has3DSupport && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          {view3D ? "Ziehen zum Drehen • Scrollen zum Zoomen" : "Klicke auf 3D für interaktive Ansicht"}
        </p>
      )}
    </div>
  )
}
