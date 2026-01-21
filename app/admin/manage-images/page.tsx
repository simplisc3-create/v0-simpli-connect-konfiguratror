'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Image from 'next/image'
import { Upload, Trash2, Check } from 'lucide-react'
import {
  leitern,
  stangensets,
  flaechensets,
  flaechensetsGlas,
  schubladen,
  einzelschubladen,
  tueren,
  klapptueren,
  funktionswaende,
  zubehoer,
  type Product,
} from '@/lib/simpli-products'

const allProducts = [
  ...leitern,
  ...stangensets,
  ...flaechensets,
  ...flaechensetsGlas,
  ...schubladen,
  ...einzelschubladen,
  ...tueren,
  ...klapptueren,
  ...funktionswaende,
  ...zubehoer,
]

interface ProductImageMap {
  [artNr: string]: string
}

export default function ManageImagesPage() {
  const [imageMap, setImageMap] = useState<ProductImageMap>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadingArtNr, setUploadingArtNr] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load images from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('product-images')
    if (saved) {
      try {
        setImageMap(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load saved images:', e)
      }
    }
    setIsLoading(false)
  }, [])

  const saveImages = (newMap: ProductImageMap) => {
    setImageMap(newMap)
    localStorage.setItem('product-images', JSON.stringify(newMap))
  }

  const handleImageUpload = async (artNr: string, file: File) => {
    if (!file) return

    try {
      setUploadingArtNr(artNr)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('artNr', artNr)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload fehlgeschlagen')
      }

      const data = await response.json()
      const imageUrl = data.url

      const newMap = { ...imageMap, [artNr]: imageUrl }
      saveImages(newMap)
      toast.success(`✓ Bild für ${artNr} hochgeladen`)
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Fehler beim Hochladen des Bildes')
    } finally {
      setUploadingArtNr(null)
    }
  }

  const handleRemoveImage = (artNr: string) => {
    const newMap = { ...imageMap }
    delete newMap[artNr]
    saveImages(newMap)
    toast.success('Bild entfernt')
  }

  const filteredProducts = allProducts.filter(
    (p) =>
      p.artNr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const productsWithImages = filteredProducts.filter((p) => imageMap[p.artNr])
  const productsWithoutImages = filteredProducts.filter((p) => !imageMap[p.artNr])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <p className="text-gray-600">Laden...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900">Produktbilder verwalten</h1>
          <p className="text-gray-600">
            Laden Sie Produktbilder hoch. Diese werden automatisch in Vercel Blob gespeichert und im Shop angezeigt.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{filteredProducts.length}</p>
                <p className="text-sm text-gray-600 mt-1">Produkte insgesamt</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{Object.keys(imageMap).length}</p>
                <p className="text-sm text-gray-600 mt-1">Mit Bildern</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">{filteredProducts.length - Object.keys(imageMap).length}</p>
                <p className="text-sm text-gray-600 mt-1">Noch zu bearbeiten</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Nach Artikel-Nr. oder Name suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Products with images */}
        {productsWithImages.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Mit Bildern ({productsWithImages.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsWithImages.map((product) => (
                <Card key={product.artNr} className="overflow-hidden hover:shadow-md transition-shadow border-green-200">
                  <CardHeader className="pb-3 bg-green-50">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{product.artNr}</CardTitle>
                      <p className="text-sm text-gray-600">{product.name}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-4">
                    {/* Image Preview */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                      <div className="relative w-full h-full">
                        <Image
                          src={imageMap[product.artNr] || '/placeholder.svg'}
                          alt={product.name}
                          fill
                          objectFit="cover"
                          className="w-full h-full"
                        />
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveImage(product.artNr)}
                      className="w-full text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Bild entfernen
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Products without images */}
        {productsWithoutImages.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">Noch zu bearbeiten ({productsWithoutImages.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsWithoutImages.map((product) => (
                <Card key={product.artNr} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{product.artNr}</CardTitle>
                      <p className="text-sm text-gray-600">{product.name}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Upload Area */}
                    <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <p className="text-xs text-gray-400 text-center px-2">Klick zum Hochladen</p>
                    </div>

                    {/* Upload Input */}
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleImageUpload(product.artNr, e.target.files[0])
                          }
                        }}
                        disabled={uploadingArtNr === product.artNr}
                        className="hidden"
                      />
                      <Button
                        asChild
                        className="w-full cursor-pointer"
                        disabled={uploadingArtNr === product.artNr}
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploadingArtNr === product.artNr ? 'Wird hochgeladen...' : 'Bild hochladen'}
                        </span>
                      </Button>
                    </label>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Keine Produkte gefunden</p>
          </div>
        )}
      </div>
    </div>
  )
}
