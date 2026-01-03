# GLB Model Setup Instructions

## Dateien hochladen

Nach dem Download des Projekts können Sie die GLB-Dateien in den `/public/models/` Ordner kopieren.

## Erwartete Dateinamen

Der Konfigurator erwartet folgende GLB-Dateien:

- `open-shelf.glb` - Offenes Fach (ohne Seitenwände)
- `no-back.glb` - Modul ohne Rückwand
- `with-back.glb` - Modul mit Rückwand
- `with-doors.glb` - Modul mit Türen
- `flip-door.glb` - Modul mit Klapptür
- `double-drawer.glb` - Modul mit Doppelschublade
- `lockable-doors.glb` - Modul mit abschließbaren Türen

## Fallback-System

- Wenn GLB-Dateien nicht gefunden werden, verwendet der Konfigurator automatisch die geometrischen 3D-Formen (Chrome-Rahmen und Panels)
- Die Funktionalität bleibt vollständig erhalten, auch ohne GLB-Dateien

## GLB-Anforderungen

- Maßstab: Die Modelle sollten ungefähr 1 Einheit = 1 Meter entsprechen
- Pivot-Punkt: Zentriert im Modul
- Farben: Die Farben werden vom Konfigurator dynamisch angewendet

## Später hinzufügen

Sie können die GLB-Dateien auch nach dem ersten Deployment hinzufügen:
1. Laden Sie die Dateien zu Vercel Blob Storage hoch
2. Oder fügen Sie sie zum `/public/models/` Ordner hinzu und deployen Sie neu
