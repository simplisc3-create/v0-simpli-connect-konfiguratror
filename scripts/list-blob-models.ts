import { list } from "@vercel/blob"

async function listModels() {
  const { blobs } = await list()

  const glbFiles = blobs.filter((blob) => blob.pathname.endsWith(".glb"))

  console.log(`Found ${glbFiles.length} GLB files:`)
  glbFiles.forEach((blob) => {
    console.log(`- ${blob.pathname}: ${blob.url}`)
  })
}

listModels()
