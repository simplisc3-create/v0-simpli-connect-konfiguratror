import { list } from "@vercel/blob"

const moduleTypes = [
  "leer",
  "mit-tueren",
  "mit-klapptuer",
  "schubladen",
  "mit-doppelschublade",
  "mit-seitenwaenden",
  "mit-rueckwand",
  "abschliessbare-tueren",
  "mit-tuer-links",
  "mit-tuer-rechts",
  "mit-abschliessbarer-tuer-links",
]

const colors = ["black", "white", "gray", "blue", "green", "orange", "red", "yellow"]

const dimensions = [
  { width: 40, height: 40, depth: 40 },
  { width: 80, height: 40, depth: 40 },
]

const panelCodes = {
  leer: [1],
  "mit-tueren": [2],
  "mit-klapptuer": [3],
  schubladen: [4],
  "mit-doppelschublade": [5],
  "mit-seitenwaenden": [6],
  "mit-rueckwand": [7],
  "abschliessbare-tueren": [8],
  "mit-tuer-links": [9],
  "mit-tuer-rechts": [10],
  "mit-abschliessbarer-tuer-links": [11],
}

export default async function GLBInventoryPage() {
  const { blobs } = await list()
  const glbFiles = blobs
    .filter((blob) => blob.pathname.endsWith(".glb"))
    .map((blob) => blob.pathname.split("/").pop() || "")

  // Generate list of expected files
  const expectedFiles: { filename: string; exists: boolean }[] = []

  dimensions.forEach((dim) => {
    moduleTypes.forEach((moduleType) => {
      const codes = panelCodes[moduleType as keyof typeof panelCodes] || []
      codes.forEach((code) => {
        colors.forEach((color) => {
          const filename = `${dim.width}x${dim.height}x${dim.depth}-1-${code}-${color}-opt.glb`
          const exists = glbFiles.includes(filename)
          expectedFiles.push({ filename, exists })
        })
      })
    })
  })

  const missingFiles = expectedFiles.filter((f) => !f.exists)
  const existingFiles = expectedFiles.filter((f) => f.exists)

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">GLB File Inventory</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Statistics: {existingFiles.length} / {expectedFiles.length} files available
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded">
            <p className="text-green-700 font-semibold">Available: {existingFiles.length}</p>
          </div>
          <div className="bg-red-50 p-4 rounded">
            <p className="text-red-700 font-semibold">Missing: {missingFiles.length}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Missing Files</h2>
        <div className="bg-red-50 p-4 rounded max-h-96 overflow-y-auto">
          {missingFiles.length === 0 ? (
            <p className="text-green-700">All files are available! 🎉</p>
          ) : (
            <ul className="space-y-1 text-sm font-mono">
              {missingFiles.map((file) => (
                <li key={file.filename} className="text-red-700">
                  ❌ {file.filename}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Available Files</h2>
        <div className="bg-green-50 p-4 rounded max-h-96 overflow-y-auto">
          <ul className="space-y-1 text-sm font-mono">
            {existingFiles.map((file) => (
              <li key={file.filename} className="text-green-700">
                ✅ {file.filename}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">All Files in Blob Storage</h2>
        <div className="bg-gray-50 p-4 rounded max-h-96 overflow-y-auto">
          <ul className="space-y-1 text-sm font-mono">
            {glbFiles.map((file) => (
              <li key={file} className="text-gray-700">
                📦 {file}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
