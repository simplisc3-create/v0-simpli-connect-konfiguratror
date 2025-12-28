# GLB Model Setup Instructions

## Verfügbare Modelle

Der Konfigurator verwendet GLB-Dateien von Vercel Blob Storage mit folgender Namenskonvention:

### 80x40x40 Module (Breite 80cm / 75cm Zellen)

**Mit Türen (Code 3):**
- `80x40x40-1-3-white-opt.glb` - Weiß
- `80x40x40-1-3-yellow-opt.glb` - Gelb
- `80x40x40-1-3-red-opt.glb` - Rot

**Mit Klapptür (Code 4):**
- `80x40x40-1-4-orange-opt.glb` - Orange
- `80x40x40-1-4-green-opt.glb` - Grün
- `80x40x40-1-4-blue-opt.glb` - Blau

### 40x40x40 Module (Breite 40cm / 38cm Zellen)

**Basis-Module (Code 2-1):**
- `40x40x40-2-1-white-opt.glb` - Weiß
- `40x40x40-2-1-orange-opt.glb` - Orange
- `40x40x40-2-1-green-opt.glb` - Grün
- `40x40x40-2-1-gray-opt.glb` - Grau

**Mit Türen Variante (Code 2-6):**
- `40x40x40-2-6-red-opt.glb` - Rot

## Dateinamen-Konvention

Format: `{Breite}x{Höhe}x{Tiefe}-{Variante}-{ModulCode}-{Farbe}-opt.glb`

- **Breite/Höhe/Tiefe:** Abmessungen in cm (z.B. 80x40x40 oder 40x40x40)
- **Variante:** 1 für 80cm Module, 2 für 40cm Module
- **ModulCode:** 
  - 80cm: 3 = Mit Türen, 4 = Mit Klapptür
  - 40cm: 1 = Basis, 6 = Mit Türen
- **Farbe:** white, yellow, red, orange, green, blue, gray

## Verfügbare Farben

| Farbe (DE) | Farbe (EN) | Hex-Code |
|------------|------------|----------|
| Schwarz    | black      | #1a1a1a  |
| Weiß       | white      | #f5f5f5  |
| Grau       | gray       | #6b7280  |
| Blau       | blue       | #00b4d8  |
| Grün       | green      | #228B22  |
| Orange     | orange     | #f97316  |
| Rot        | red        | #dc2626  |
| Gelb       | yellow     | #eab308  |

## Fallback-System

- Wenn GLB-Dateien nicht verfügbar sind, verwendet der Konfigurator automatisch die geometrischen 3D-Formen (Chrome-Rahmen und farbige Panels)
- Die Funktionalität bleibt vollständig erhalten

## Neue Modelle hinzufügen

Um neue GLB-Modelle hinzuzufügen:

1. Laden Sie die GLB-Datei zu Vercel Blob Storage hoch
2. Fügen Sie die URL zur `GLB_URLS` Map in `components/glb-module-loader.tsx` hinzu
3. Aktualisieren Sie die `COLOR_TO_FILE_CODE` Zuordnung falls neue Farben hinzukommen
4. Aktualisieren Sie `lib/simpli-products.ts` mit neuen Farben im `ShelfColor` Type und `colorHexMap`

## GLB-Anforderungen

- **Maßstab:** Modelle sollten ungefähr 1 Einheit = 1 Meter entsprechen
- **Pivot-Punkt:** Zentriert im Modul
- **Optimierung:** Verwenden Sie komprimierte/optimierte GLB-Dateien (`-opt.glb`)
