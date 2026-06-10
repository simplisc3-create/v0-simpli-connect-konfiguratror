import { NextResponse } from "next/server"
import { buildRenderJobs } from "@/lib/catalog-data"

// Liefert die Liste aller Render-Job-IDs (für den extern gesteuerten Lauf).
export async function GET() {
  const jobs = buildRenderJobs().map((j) => ({ jobId: j.jobId, itemId: j.itemId }))
  return NextResponse.json({ jobs })
}
