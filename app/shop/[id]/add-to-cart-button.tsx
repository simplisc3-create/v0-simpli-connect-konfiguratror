"use client"

import { useState } from "react"
import { ShoppingCart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/lib/cart-store"

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    artNr: string
    price: number
    image: string
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      artNr: product.artNr,
      price: product.price,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Button
      size="lg"
      onClick={handleAdd}
      disabled={added}
      className={`w-full font-semibold py-6 text-lg rounded-xl transition-all duration-300 hover:shadow-lg ${
        added
          ? "bg-green-600 hover:bg-green-600 text-white"
          : "bg-black hover:bg-gray-800 text-white"
      }`}
    >
      {added ? (
        <>
          <Check className="w-5 h-5 mr-2" />
          Hinzugefügt
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          In den Warenkorb
        </>
      )}
    </Button>
  )
}
