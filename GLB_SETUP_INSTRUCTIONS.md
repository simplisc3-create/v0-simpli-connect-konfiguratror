# GLB Model Setup Instructions

## Verfügbare Modelle

Der Konfigurator verwendet GLB-Dateien von Vercel Blob Storage mit folgender Namenskonvention:

### 80x40x40 Module (Breite 80cm)

**Mit Türen (Code 3):**
- `80x40x40-1-3-white-opt.glb` - Weiß
- `80x40x40-1-3-yellow-opt.glb` - Gelb
- `80x40x40-1-3-red-opt.glb` - Rot

**Mit Klapptür (Code 4):**
- `80x40x40-1-4-orange-opt.glb` - Orange
- `80x40x40-1-4-green-opt.glb` - Grün
- `80x40x40-1-4-blue-opt.glb` - Blau

## Dateinamen-Konvention

Format: `{Breite}x{Höhe}x{Tiefe}-{Variante}-{ModulCode}-{Farbe}-opt.glb`

- **Breite/Höhe/Tiefe:** Abmessungen in cm (z.B. 80x40x40)
- **Variante:** 1 für 80cm Module, 2 für 40cm Module
- **ModulCode:** 3 = Mit Türen, 4 = Mit Klapptür
- **Farbe:** white, yellow, red, orange, green, blue

## Fallback-System

- Wenn GLB-Dateien nicht verfügbar sind, verwendet der Konfigurator automatisch die geometrischen 3D-Formen (Chrome-Rahmen und farbige Panels)
- Die Funktionalität bleibt vollständig erhalten
- 40cm Module verwenden immer das Fallback-System

## Neue Modelle hinzufügen

Um neue GLB-Modelle hinzuzufügen:

1. Laden Sie die GLB-Datei zu Vercel Blob Storage hoch
2. Fügen Sie die URL zur `GLB_URLS` Map in `components/glb-module-loader.tsx` hinzu
3. Aktualisieren Sie die `MODULE_TYPE_TO_CODE` Zuordnung falls nötig

## GLB-Anforderungen

- **Maßstab:** Modelle sollten ungefähr 1 Einheit = 1 Meter entsprechen
- **Pivot-Punkt:** Zentriert im Modul
- **Optimierung:** Verwenden Sie komprimierte/optimierte GLB-Dateien (`-opt.glb`)
