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
    toast.success(`✓ Bild für ${artNr} gelöscht`)
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
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Produktbilder verwalten</h1>
          <p className="text-muted-foreground">
            Laden Sie Produktbilder hoch. Diese werden automatisch in Vercel Blob gespeichert und im Shop angezeigt.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-primary">{filteredProducts.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Produkte insgesamt</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-secondary">{Object.keys(imageMap).length}</p>
              <p className="text-sm text-muted-foreground mt-1">Mit Bildern</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-destructive">{filteredProducts.length - Object.keys(imageMap).length}</p>
              <p className="text-sm text-muted-foreground mt-1">Noch zu bearbeiten</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-8">
          <Input
            placeholder="Nach Artikel-Nr. oder Name suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-muted"
          />
        </div>

        {/* Products with images */}
        {productsWithImages.length > 0 && (
          <div className="mb-12">
            <CardHeader className="pb-3 bg-muted">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-secondary" />
                <h2 className="text-xl font-semibold text-foreground">Mit Bildern ({productsWithImages.length})</h2>
              </div>
            </CardHeader>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {productsWithImages.map((product) => (
                <div key={product.artNr} className="border border-border rounded-lg overflow-hidden">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                    {imageMap[product.artNr] ? (
                      <img
                        src={imageMap[product.artNr]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-muted-foreground">Kein Bild</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-foreground font-medium">{product.artNr}</p>
                    <p className="text-sm text-muted-foreground">{product.name}</p>
                    <Button
                      onClick={() => handleRemoveImage(product.artNr)}
                      variant="ghost"
                      className="w-full text-xs hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 mt-3"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Löschen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products without images */}
        {productsWithoutImages.length > 0 && (
          <div>
            <CardHeader className="pb-3 bg-muted">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-destructive" />
                <h2 className="text-xl font-semibold text-foreground">Noch zu bearbeiten ({productsWithoutImages.length})</h2>
              </div>
            </CardHeader>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
              {productsWithoutImages.map((product) => (
                <div key={product.artNr} className="border border-border rounded-lg overflow-hidden">
                  <label className="cursor-pointer block">
                    <div className="aspect-square bg-muted rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(product.artNr, e.target.files[0])}
                        disabled={uploadingArtNr === product.artNr}
                        className="hidden"
                      />
                      <div className="text-center pointer-events-none">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground text-center px-2">Klick zum Hochladen</p>
                      </div>
                    </div>
                  </label>
                  <div className="p-4">
                    <p className="text-sm text-foreground font-medium">{product.artNr}</p>
                    <p className="text-sm text-muted-foreground">{product.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Keine Produkte gefunden</p>
          </div>
        )}
      </div>
    </div>
  )
}
