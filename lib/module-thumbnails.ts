// Module thumbnail registry - maps module types to their 2D thumbnail SVGs

export interface ModuleThumbnail {
  id: string
  name: string
  thumbnail: string
  shopUrl: string
  width: 40 | 80
}

// 80cm Module Thumbnails
export const modules80: ModuleThumbnail[] = [
  {
    id: "1-1",
    name: "Offenes Fach",
    thumbnail: "/images/module-thumbnails/80/offenes-fach.svg",
    shopUrl: "/shop/offenes-fach-80",
    width: 80,
  },
  {
    id: "1-2",
    name: "Ohne Seitenwände",
    thumbnail: "/images/module-thumbnails/80/ohne-seitenwaende.svg",
    shopUrl: "/shop/ohne-seitenwaende-80",
    width: 80,
  },
  {
    id: "1-3",
    name: "Mit Rückwand",
    thumbnail: "/images/module-thumbnails/80/mit-rueckwand.svg",
    shopUrl: "/shop/mit-rueckwand-80",
    width: 80,
  },
  {
    id: "1-4",
    name: "Mit Klapptür",
    thumbnail: "/images/module-thumbnails/80/mit-klapptuer.svg",
    shopUrl: "/shop/mit-klapptuer-80",
    width: 80,
  },
  {
    id: "1-4b",
    name: "Mit Klapptür oben",
    thumbnail: "/images/module-thumbnails/80/mit-klapptuer-oben.svg",
    shopUrl: "/shop/mit-klapptuer-oben-80",
    width: 80,
  },
  {
    id: "1-5",
    name: "Mit Doppelschublade",
    thumbnail: "/images/module-thumbnails/80/mit-doppelschublade.svg",
    shopUrl: "/shop/mit-doppelschublade-80",
    width: 80,
  },
  {
    id: "1-5b",
    name: "Mit Einzelschublade",
    thumbnail: "/images/module-thumbnails/80/mit-einzelschublade.svg",
    shopUrl: "/shop/mit-einzelschublade-80",
    width: 80,
  },
  {
    id: "1-6",
    name: "Mit Türen",
    thumbnail: "/images/module-thumbnails/80/mit-tueren.svg",
    shopUrl: "/shop/mit-tueren-80",
    width: 80,
  },
  {
    id: "1-7",
    name: "Abschließbare Türen",
    thumbnail: "/images/module-thumbnails/80/abschliessbare-tueren.svg",
    shopUrl: "/shop/abschliessbare-tueren-80",
    width: 80,
  },
  {
    id: "1-8",
    name: "Ohne Rückwand",
    thumbnail: "/images/module-thumbnails/80/ohne-rueckwand.svg",
    shopUrl: "/shop/ohne-rueckwand-80",
    width: 80,
  },
]

// 40cm Module Thumbnails
export const modules40: ModuleThumbnail[] = [
  {
    id: "2-1",
    name: "Offenes Fach",
    thumbnail: "/images/module-thumbnails/40/offenes-fach.svg",
    shopUrl: "/shop/offenes-fach-40",
    width: 40,
  },
  {
    id: "2-2",
    name: "Ohne Seitenwände",
    thumbnail: "/images/module-thumbnails/40/ohne-seitenwaende.svg",
    shopUrl: "/shop/ohne-seitenwaende-40",
    width: 40,
  },
  {
    id: "2-3",
    name: "Mit Rückwand",
    thumbnail: "/images/module-thumbnails/40/mit-rueckwand.svg",
    shopUrl: "/shop/mit-rueckwand-40",
    width: 40,
  },
  {
    id: "2-4",
    name: "Tür rechts",
    thumbnail: "/images/module-thumbnails/40/mit-tuere-rechts.svg",
    shopUrl: "/shop/mit-tuere-rechts-40",
    width: 40,
  },
  {
    id: "2-5",
    name: "Tür links",
    thumbnail: "/images/module-thumbnails/40/mit-tuere-links.svg",
    shopUrl: "/shop/mit-tuere-links-40",
    width: 40,
  },
  {
    id: "2-6",
    name: "Abschließbar links",
    thumbnail: "/images/module-thumbnails/40/abschliessbar-links.svg",
    shopUrl: "/shop/abschliessbar-links-40",
    width: 40,
  },
  {
    id: "2-7",
    name: "Abschließbar rechts",
    thumbnail: "/images/module-thumbnails/40/abschliessbar-rechts.svg",
    shopUrl: "/shop/abschliessbar-rechts-40",
    width: 40,
  },
]

// Get all modules
export const allModules = [...modules80, ...modules40]

// Get module by ID
export function getModuleThumbnail(id: string): ModuleThumbnail | undefined {
  return allModules.find((m) => m.id === id)
}

// Get modules by width
export function getModulesByWidth(width: 40 | 80): ModuleThumbnail[] {
  return width === 80 ? modules80 : modules40
}

// Map thumbnail module IDs to actual moduleType IDs used by the configurator
export type ModuleTypeId = 
  | "offenes-fach"
  | "ohne-seitenwaende"
  | "mit-rueckwand"
  | "mit-klapptuer"
  | "mit-klapptuer-oben"
  | "mit-doppelschublade"
  | "mit-einzelschublade"
  | "mit-tueren"
  | "abschliessbare-tueren"
  | "ohne-rueckwand"
  | "mit-tuere-rechts"
  | "mit-tuere-links"
  | "abschliessbar-links"
  | "abschliessbar-rechts"

const thumbnailIdToModuleType: Record<string, ModuleTypeId> = {
  // 80cm modules
  "1-1": "offenes-fach",
  "1-2": "ohne-seitenwaende",
  "1-3": "mit-rueckwand",
  "1-4": "mit-klapptuer",
  "1-4b": "mit-klapptuer-oben",
  "1-5": "mit-doppelschublade",
  "1-5b": "mit-einzelschublade",
  "1-6": "mit-tueren",
  "1-7": "abschliessbare-tueren",
  "1-8": "ohne-rueckwand",
  // 40cm modules
  "2-1": "offenes-fach",
  "2-2": "ohne-seitenwaende",
  "2-3": "mit-rueckwand",
  "2-4": "mit-tuere-rechts",
  "2-5": "mit-tuere-links",
  "2-6": "abschliessbar-links",
  "2-7": "abschliessbar-rechts",
}

export function getModuleTypeFromThumbnailId(id: string): ModuleTypeId {
  return thumbnailIdToModuleType[id] || "offenes-fach"
}
