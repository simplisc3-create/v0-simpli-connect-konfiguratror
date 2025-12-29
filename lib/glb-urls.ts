// GLB model URLs from Vercel Blob storage
// Base URL for all GLB files
export const BLOB_BASE_URL = "https://xo2a99j1qyph0ija.public.blob.vercel-storage.com"

export const GLB_BLOB_URLS: Record<string, string> = {
  "drawer-gray": "/images/80x40x40-1-5-gray-opt-20-282-29.glb",

  "door-green": "/images/80x40x40-1-6-green-opt-20-281-29.glb",

  // Basic modules (code 3 - without back panel)
  "80x40x40-1-3-white": `${BLOB_BASE_URL}/80x40x40-1-3-white-opt.glb`,
  "80x40x40-1-3-yellow": `${BLOB_BASE_URL}/80x40x40-1-3-yellow-opt.glb`,
  "80x40x40-1-3-red": `${BLOB_BASE_URL}/80x40x40-1-3-red-opt.glb`,

  // Basic modules (code 4 - with back panel)
  "80x40x40-1-4-orange": `${BLOB_BASE_URL}/80x40x40-1-4-orange-opt.glb`,
  "80x40x40-1-4-green": `${BLOB_BASE_URL}/80x40x40-1-4-green-opt.glb`,
  "80x40x40-1-4-blue": `${BLOB_BASE_URL}/80x40x40-1-4-blue-opt.glb`,

  // 40cm modules
  "40x40x40-2-1-white": `${BLOB_BASE_URL}/40x40x40-2-1-white-opt.glb`,
  "40x40x40-2-1-orange": `${BLOB_BASE_URL}/40x40x40-2-1-orange-opt.glb`,
  "40x40x40-2-1-green": `${BLOB_BASE_URL}/40x40x40-2-1-green-opt.glb`,
  "40x40x40-2-1-gray": `${BLOB_BASE_URL}/40x40x40-2-1-gray-opt.glb`,
  "40x40x40-2-6-red": `${BLOB_BASE_URL}/40x40x40-2-6-red-opt.glb`,
}

// Color hex values for special colors
export const SPECIAL_COLOR_HEX: Record<string, string> = {
  weiss: "#ffffff",
  schwarz: "#333333",
  blau: "#2563eb",
  gruen: "#16a34a",
  orange: "#ea580c",
  rot: "#dc2626",
  gelb: "#eab308",
  grau: "#6b7280",
}

// Map German color names to file codes
export const COLOR_TO_FILE_CODE: Record<string, string> = {
  weiss: "white",
  schwarz: "gray",
  blau: "blue",
  gruen: "green",
  orange: "orange",
  rot: "red",
  gelb: "yellow",
  grau: "gray",
}
