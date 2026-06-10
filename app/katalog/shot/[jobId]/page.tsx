"use client"

import { use, useEffect, useState } from "react"
import { CaptureStudioCanvas, type CaptureJobInput } from "@/components/catalog/capture-scene"
import { buildRenderJobs, getItemById } from "@/lib/catalog-data"

const CAPTURE_SIZE = 900

declare global {
  interface Window {
    __shotDone?: { jobId: string; ok: boolean; error?: string }
  }
}

// Einzel-Shot-Seite: rendert genau EINEN Job, lädt ihn hoch und setzt
// window.__shotDone. Dadurch kann der Render-Lauf extern (pro Navigation)
// gesteuert werden – jede Navigation hält den Tab im Vordergrund.
export default function ShotPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params)
  const [state, setState] = useState<"rendering" | "done" | "error">("rendering")
  const [busy, setBusy] = useState(false)

  const job = buildRenderJobs().find((j) => j.jobId === decodeURIComponent(jobId))
  const item = job ? getItemById(job.itemId) : undefined

  useEffect(() => {
    if (!job || !item) {
      window.__shotDone = { jobId, ok: false, error: "job-not-found" }
      setState("error")
    }
  }, [job, item, jobId])

  const handleCapture = async (capturedJobId: string, dataUrl: string) => {
    if (busy || !job) return
    setBusy(true)
    try {
      const res = await fetch("/api/katalog/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.jobId, dataUrl }),
      })
      const data = await res.json()
      if (data.url) {
        window.__shotDone = { jobId: job.jobId, ok: true }
        setState("done")
      } else {
        window.__shotDone = { jobId: job.jobId, ok: false, error: data.error ?? "upload" }
        setState("error")
      }
    } catch (e) {
      window.__shotDone = { jobId: job.jobId, ok: false, error: String(e) }
      setState("error")
    }
  }

  const handleError = (erroredJobId: string) => {
    window.__shotDone = { jobId: erroredJobId, ok: false, error: "capture-failed" }
    setState("error")
  }

  const captureJob: CaptureJobInput | null =
    job && item
      ? {
          jobId: job.jobId,
          itemId: job.itemId,
          preset: item.preset,
          colorGerman: job.colorGerman,
          view: job.view,
        }
      : null

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-100 p-6">
      <div className="overflow-hidden rounded-lg border border-zinc-300 bg-white">
        {captureJob ? (
          <div style={{ width: 420, height: 420 }} className="overflow-hidden">
            <div
              style={{
                width: CAPTURE_SIZE,
                height: CAPTURE_SIZE,
                transform: `scale(${420 / CAPTURE_SIZE})`,
                transformOrigin: "top left",
              }}
            >
              <CaptureStudioCanvas job={captureJob} size={CAPTURE_SIZE} onCapture={handleCapture} onError={handleError} />
            </div>
          </div>
        ) : (
          <div className="flex h-[420px] w-[420px] items-center justify-center text-sm text-zinc-500">
            Job nicht gefunden
          </div>
        )}
      </div>
      <p data-shot-state={state} className="font-mono text-sm text-zinc-700">
        {jobId} — {state}
      </p>
    </main>
  )
}
