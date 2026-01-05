// src/lib/glb/registry.ts
export const GLB_BASE_URL = "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com"

export type WidthKey = 40 | 80
export type HeightKey = number

export type ColorKey = "white" | "gray" | "black" | "blue" | "green" | "yellow" | "orange" | "red"

// Globaler Union-Type (weil 40er mehr Module hat)
export type ModuleType =
  | "ohne-seitenwaende"
  | "ohne-rueckwand"
  | "mit-rueckwand"
  | "mit-seitenwaenden"
  | "mit-tueren"
  | "mit-klapptuer"
  | "mit-doppelschublade"
  | "abschliessbare-tueren"
  | "mit-tuere-links"
  | "mit-tuere-rechts"
  | "abschliessbar-links"
  | "abschliessbar-rechts"

export const MODULE_TYPES: ModuleType[] = [
  // shared / 80-family
  "ohne-seitenwaende",
  "ohne-rueckwand",
  "mit-rueckwand",
  "mit-seitenwaenden",
  "mit-tueren",
  "mit-klapptuer",
  "mit-doppelschublade",
  "abschliessbare-tueren",
  // 40-family extras
  "mit-tuere-links",
  "mit-tuere-rechts",
  "abschliessbar-links",
  "abschliessbar-rechts",
]

export const COLOR_KEYS: ColorKey[] = ["white", "gray", "black", "blue", "green", "yellow", "orange", "red"]

// ✅ DEINE MAPPINGS (editierbar in EINER Stelle)
export const MODULE_TO_VARIANT_CODE: Record<WidthKey, Partial<Record<ModuleType, string>>> = {
  80: {
    "ohne-rueckwand": "1-1", // Changed from 1-8 to match white80/80x40x40-1-1-white_optimized.glb
    "ohne-seitenwaende": "1-1",
    "mit-seitenwaenden": "1-3",
    "mit-klapptuer": "1-4",
    "mit-doppelschublade": "1-5",
    "mit-tueren": "1-6",
    "abschliessbare-tueren": "1-7",
    "mit-rueckwand": "1-8",
  },
  40: {
    "ohne-rueckwand": "2-1",
    "mit-rueckwand": "2-2",
    "mit-seitenwaenden": "2-3",
    "mit-tuere-rechts": "2-4",
    "mit-tuere-links": "2-5",
    "abschliessbar-links": "2-6",
    "abschliessbar-rechts": "2-7",
  },
}

export const SPECIAL_FRAME_URLS: Record<string, string> = {
  "frame-80": "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com/frame80.glb",
}

export function buildGlbFilename(args: {
  width: WidthKey
  height: HeightKey
  variantCode: string
  color: ColorKey
}) {
  const { width, height, variantCode, color } = args
  return `${width}x40x${height}-${variantCode}-${color}_optimized.glb`
}

export function buildFolderPath(color: ColorKey, width: WidthKey): string {
  return `${color}${width}`
}

export function resolveGlbUrl(args: {
  width: WidthKey
  height: HeightKey
  moduleType: ModuleType
  color: ColorKey
}) {
  const { width, height, moduleType, color } = args

  // Special handling for frame80
  if (moduleType === "ohne-seitenwaende" && width === 80) {
    return {
      url: SPECIAL_FRAME_URLS["frame-80"],
      filename: "frame80.glb",
      variantCode: "frame-80",
    }
  }

  const variantCode = MODULE_TO_VARIANT_CODE[width]?.[moduleType]

  if (!variantCode) {
    console.warn(`[v0] No variantCode mapping for width=${width} moduleType="${moduleType}". Falling back to frame80.`)
    return {
      url: SPECIAL_FRAME_URLS["frame-80"],
      filename: "frame80.glb",
      variantCode: "frame-80",
    }
  }

  const filename = buildGlbFilename({ width, height, variantCode, color })
  const folderPath = buildFolderPath(color, width)
  const url = `${GLB_BASE_URL}/${folderPath}/${filename}`
  return { url, filename, variantCode }
}
