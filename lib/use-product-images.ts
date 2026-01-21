// Utility to get product images from localStorage
export function getProductImage(artNr: string): string | undefined {
  if (typeof window === 'undefined') return undefined

  try {
    const saved = localStorage.getItem('product-images')
    if (saved) {
      const imageMap = JSON.parse(saved)
      return imageMap[artNr]
    }
  } catch (e) {
    console.error('Failed to load product image:', e)
  }

  return undefined
}

// Get all product images
export function getAllProductImages(): Record<string, string> {
  if (typeof window === 'undefined') return {}

  try {
    const saved = localStorage.getItem('product-images')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Failed to load product images:', e)
  }

  return {}
}
