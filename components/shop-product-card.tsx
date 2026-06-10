"use client"

import Link from "next/link"
import type React from "react"
import { useState } from "react"
import { ShoppingCart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Product3DPreview } from "@/components/product-3d-preview"
import { useCartStore } from "@/lib/cart-store"
import type { ShopModule } from "@/lib/shop-modules"

export function ShopProductCard({ product }: { product: ShopModule }) {
  const { addItem } = useCartStore()
  const [added, setAdded] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      artNr: product.artNr,
      price: product.price,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link href={`/shop/${product.id}`} className="block">
      <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300">
        <div className="aspect-square overflow-hidden flex items-center justify-center bg-gray-50 relative">
          <Product3DPreview
            moduleType={product.glbModule.moduleType}
            color={product.glbModule.color}
            width={product.glbModule.width}
            autoRotate={true}
          />
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">{product.artNr}</p>
          <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">{product.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-bold text-lg">ab {product.price.toFixed(2)} €</span>
            <Button
              size="sm"
              variant={added ? "default" : "outline"}
              className={`gap-1 ${added ? "bg-green-600 hover:bg-green-600" : "bg-transparent hover:bg-gray-100"}`}
              onClick={handleAdd}
            >
              {added ? (
                <>
                  <Check className="w-3 h-3" />
                  Hinzugefügt
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3 h-3" />
                  Hinzufügen
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}
