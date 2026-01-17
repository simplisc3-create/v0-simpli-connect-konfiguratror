import ProductPageClient from "./ProductPageClient"
import { notFound } from "next/navigation"
import { products } from "@/lib/products"

// Generate static params for all products
export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }))
}

// Generate metadata for each product page
export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = params
  const product = products.find((p) => p.id === id)

  if (!product) {
    return {
      title: "Produkt nicht gefunden | Simpli Connect",
    }
  }

  return {
    title: `${product.name} | Simpli Connect Shop`,
    description: product.description || `${product.name} - Hochwertiges Regalmodul von Simpli Connect`,
  }
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const { id } = params
  const product = products.find((p) => p.id === id)

  if (!product) {
    notFound()
  }

  return <ProductPageClient product={product} />
}
