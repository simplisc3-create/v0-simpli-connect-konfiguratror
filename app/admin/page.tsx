import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Upload, ImageIcon } from 'lucide-react'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Bereich</h1>
          <p className="text-muted-foreground">Verwaltung und Konfiguration des Simpli Connect Shops</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Image Management Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Produktbilder verwalten
                  </CardTitle>
                </div>
                <CheckCircle className="w-6 h-6 text-secondary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Laden Sie Produktbilder hoch und verwalten Sie diese zentral. Bilder werden automatisch auf der Shop-Seite aktualisiert.
              </p>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>✓ Bilder hochladen über Vercel Blob</li>
                <li>✓ Live-Vorschau der Bilder</li>
                <li>✓ Automatische Aktualisierung im Shop</li>
                <li>✓ Alle Produkte verwaltbar</li>
              </ul>
              <Link href="/admin/manage-images" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90">
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
                <CheckCircle className="w-6 h-6 text-secondary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Der Shop ist vollständig integriert und bereit für die Bildverwaltung.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-foreground">Shop Listing</span>
                  <span className="text-secondary font-medium">✓ Aktiv</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-foreground">Produktdetails</span>
                  <span className="text-secondary font-medium">✓ Aktiv</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-foreground">Bildverwaltung</span>
                  <span className="text-secondary font-medium">✓ Aktiviert</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-foreground">LocalStorage Sync</span>
                  <span className="text-secondary font-medium">✓ Aktiv</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">So funktioniert es:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">Produktbilder hochladen</p>
                  <p className="text-sm text-muted-foreground">Gehen Sie zu "Produktbilder verwalten" und laden Sie Bilder für jedes Produkt hoch.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">Bilder werden gespeichert</p>
                  <p className="text-sm text-muted-foreground">Die Bilder werden automatisch in Vercel Blob gespeichert und in Ihrem Browser gecacht.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Shop wird aktualisiert</p>
                  <p className="text-sm text-muted-foreground">Die Bilder erscheinen sofort im Shop und auf den Produktdetailseiten.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-background rounded-lg border border-border">
              <p className="text-sm font-medium text-foreground mb-2">Schneller Zugriff:</p>
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
