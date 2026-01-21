'use client';

import { useEffect, useState } from 'react'

interface ProductImageMap {
  [artNr: string]: string
}

export function useProductImages() {
  const [imageMap, setImageMap] = useState<ProductImageMap>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('product-images')
    if (saved) {
      try {
        setImageMap(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load product images:', e)
      }
    }
    setIsLoading(false)
  }, [])

  const getImage = (artNr: string): string | undefined => {
    return imageMap[artNr]
  }

  return { imageMap, isLoading, getImage }
}
