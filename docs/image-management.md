# Dynamische Bildverwaltung - Simpli Connect Shop

## Übersicht

Das Admin-Panel ermöglicht es dir, Produktbilder hochzuladen und diese automatisch im Shop anzuzeigen. Alle Bilder werden in Vercel Blob gespeichert und der Shop-Seiten werden in Echtzeit aktualisiert.

## Wie es funktioniert

### 1. Bilder hochladen
- Gehe zu **Admin → Produktbilder verwalten**
- Suche das Produkt nach Artikel-Nr. oder Name
- Klick auf "Bild hochladen"
- Wähle ein Bild von deinem Computer

### 2. Speicherung
- Das Bild wird zu Vercel Blob hochgeladen
- Die Bildverwaltung speichert die URL in deinem Browser (localStorage)
- Mehrere Bilder können parallel hochgeladen werden

### 3. Automatische Anzeige
- Shop-Listing (app/shop/page.tsx): Zeigt hochgeladene Bilder
- Produktdetails (app/shop/[id]/page.tsx): Zeigt hochgeladene Bilder  
- Related Products: Zeigt hochgeladene Bilder
- Fallback: Falls kein Bild hochgeladen, wird das Default-Bild verwendet

## Verwaltung

### Bilder organisiert nach Status
- **Mit Bildern (grün)**: Produkte mit hochgeladenen Bildern
- **Noch zu bearbeiten (orange)**: Produkte ohne Bilder

### Bilder entfernen
- Klick auf "Bild entfernen" bei einem Produkt mit Bild
- Die URL wird aus deinem Browser gelöscht
- Der Shop zeigt wieder das Default-Bild

### Bilder überschreiben
- Laden Sie einfach ein neues Bild für ein Produkt hoch
- Das alte Bild wird automatisch überschrieben
- Die Änderung ist sofort sichtbar im Shop

## Technische Details

### API Route: /api/upload
- Empfängt Bilddatei und Artikel-Nr. (artNr)
- Speichert zu Vercel Blob mit eindeutigen Namen
- Gibt Blob-URL zurück

### Hook: useProductImages
- Lädt Bilder aus localStorage
- Synchronisiert automatisch zwischen Tabs
- Gibt Bilder-Mapping und getImage-Funktion zurück

### Datenspeicherung
- LocalStorage Key: `product-images`
- Format: `{ artNr: "blob-url", artNr2: "blob-url2", ... }`
- Speichert dauerhaft in deinem Browser

## Tipps

1. **Konsistenz**: Lade Bilder mit gleicher Größe und Format (JPG/PNG)
2. **Schnell**: Alle Bilder sollten 40x40cm Fronten hochgeladen sein
3. **Fallback**: Der Shop zeigt Default-Bilder falls nötig
4. **Sync**: Bilder werden sofort im Shop angezeigt (nach Page-Refresh)

## Fehlerbehebung

**Problem: Bilder werden nicht angezeigt**
- Stelle sicher, dass JavaScript im Browser aktiviert ist
- Lösche Browser-Cache und versuche erneut
- Prüfe, ob das Bild wirklich hochgeladen wurde

**Problem: Upload schlägt fehl**
- Prüfe Dateigröße (max. 5MB empfohlen)
- Stelle sicher, dass Format JPG/PNG ist
- Prüfe deine Internet-Verbindung

**Problem: Alte Bilder werden noch angezeigt**
- Clear Browser Cache (Ctrl+Shift+Delete)
- Hard Refresh (Ctrl+F5)
- Lösche localStorage: `localStorage.removeItem('product-images')`
