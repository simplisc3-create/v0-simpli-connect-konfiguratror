import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Upload, ImageIcon } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Bereich</h1>
          <p className="text-gray-600">Verwaltung und Konfiguration des Simpli Connect Shops</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Image Management Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    Produktbilder verwalten
                  </CardTitle>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Laden Sie Produktbilder hoch und verwalten Sie diese zentral. Bilder werden automatisch auf der Shop-Seite aktualisiert.
              </p>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>✓ Bilder hochladen über Vercel Blob</li>
                <li>✓ Live-Vorschau der Bilder</li>
                <li>✓ Automatische Aktualisierung im Shop</li>
                <li>✓ Alle Produkte verwaltbar</li>
              </ul>
              <Link href="/admin/manage-images" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Zur Bildverwaltung
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Shop Status Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Shop Status</CardTitle>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Der Shop ist vollständig integriert und bereit für die Bildverwaltung.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-gray-700">Shop Listing</span>
                  <span className="text-green-600 font-medium">✓ Aktiv</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-gray-700">Produktdetails</span>
                  <span className="text-green-600 font-medium">✓ Aktiv</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-gray-700">Bildverwaltung</span>
                  <span className="text-green-600 font-medium">✓ Aktiviert</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-gray-700">LocalStorage Sync</span>
                  <span className="text-green-600 font-medium">✓ Aktiv</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">So funktioniert es:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Produktbilder hochladen</p>
                  <p className="text-sm text-gray-600">Gehen Sie zu "Produktbilder verwalten" und laden Sie Bilder für jedes Produkt hoch.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">Bilder werden gespeichert</p>
                  <p className="text-sm text-gray-600">Die Bilder werden automatisch in Vercel Blob gespeichert und in Ihrem Browser gecacht.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">Shop wird aktualisiert</p>
                  <p className="text-sm text-gray-600">Die Bilder erscheinen sofort im Shop und auf den Produktdetailseiten.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-gray-900 mb-2">Schneller Zugriff:</p>
              <div className="flex gap-2 flex-wrap">
                <Link href="/admin/manage-images">
                  <Button variant="outline" size="sm">
                    Bildverwaltung
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline" size="sm">
                    Zum Shop
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
