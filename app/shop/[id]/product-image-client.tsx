'use client'

import Image from 'next/image'
import { useProductImages } from '@/hooks/use-product-images'

export function ProductImageClient({
  artNr,
  defaultImage,
  productName,
  priority = false,
}: {
  artNr: string
  defaultImage: string
  productName: string
  priority?: boolean
}) {
  const { imageMap } = useProductImages()
  const imageUrl = imageMap[artNr] || defaultImage

  return (
    null
  )
}
