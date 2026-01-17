import Link from "next/link"
import { ArrowLeft, Package } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProductNotFound() {
  return (
    <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="w-24 h-24 mx-auto bg-neutral-900 rounded-full flex items-center justify-center mb-6">
          <Package className="w-12 h-12 text-neutral-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-100 mb-3">Produkt nicht gefunden</h1>
        <p className="text-neutral-400 mb-8 max-w-md">Das gesuchte Produkt existiert nicht oder wurde entfernt.</p>
        <Button asChild className="bg-teal-500 hover:bg-teal-600">
          <Link href="/shop">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Shop
          </Link>
        </Button>
      </div>
    </main>
  )
}
