"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CaptureScene } from "@/components/catalog/capture-scene"
import { buildRenderJobs, getItemById, type RenderJob } from "@/lib/catalog-data"

type Status = "idle" | "running" | "saving" | "done" | "error"

const CAPTURE_SIZE = 900
const PER_JOB_TIMEOUT = 12000

export default function KatalogStudioPage() {
  const jobs = useMemo(() => buildRenderJobs(), [])
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<Status>("idle")
  const [log, setLog] = useState<string[]>([])
  const imagesRef = useRef<Record<string, string>>({})
  const startedRef = useRef(false)
  const capturedForIndexRef = useRef<number>(-1)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentJob: RenderJob | undefined = jobs[index]

  const appendLog = useCallback((msg: string) => {
    setLog((l) => [...l.slice(-60), msg])
  }, [])

  const advance = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIndex((i) => i + 1)
  }, [])

  const uploadCapture = useCallback(
    async (job: RenderJob, dataUrl: string) => {
      try {
        const res = await fetch("/api/katalog/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: job.jobId, dataUrl }),
        })
        const data = await res.json()
        if (data.url) {
          imagesRef.current[job.jobId] = data.url
          appendLog(`OK  ${job.jobId}`)
        } else {
          appendLog(`ERR ${job.jobId}: ${data.error ?? "unbekannt"}`)
        }
      } catch (e) {
        appendLog(`ERR ${job.jobId}: upload`)
      }
      advance()
    },
    [advance, appendLog],
  )

  const handleCapture = useCallback(
    (dataUrl: string) => {
      if (!currentJob) return
      if (capturedForIndexRef.current === index) return
      capturedForIndexRef.current = index
      uploadCapture(currentJob, dataUrl)
    },
    [currentJob, index, uploadCapture],
  )

  // Pro Job ein Sicherheits-Timeout, damit die Pipeline nie hängen bleibt.
  useEffect(() => {
    if (status !== "running" || !currentJob) return
    capturedForIndexRef.current = -1
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      if (capturedForIndexRef.current !== index) {
        appendLog(`TIMEOUT ${currentJob.jobId}`)
        capturedForIndexRef.current = index
        advance()
      }
    }, PER_JOB_TIMEOUT)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [index, status, currentJob, advance, appendLog])

  // Abschluss: Manifest speichern
  useEffect(() => {
    if (status !== "running") return
    if (index < jobs.length) return
    setStatus("saving")
    appendLog(`Speichere Manifest mit ${Object.keys(imagesRef.current).length} Bildern …`)
    fetch("/api/katalog/manifest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: imagesRef.current }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) {
          setStatus("done")
          appendLog(`Fertig. ${d.count} Bilder gespeichert.`)
        } else {
          setStatus("error")
          appendLog(`Manifest-Fehler: ${d.error ?? "unbekannt"}`)
        }
      })
      .catch(() => {
        setStatus("error")
        appendLog("Manifest-Speichern fehlgeschlagen.")
      })
  }, [index, jobs.length, status, appendLog])

  const start = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    imagesRef.current = {}
    setIndex(0)
    setStatus("running")
    appendLog(`Starte Rendering von ${jobs.length} Ansichten …`)
  }, [jobs.length, appendLog])

  const item = currentJob ? getItemById(currentJob.itemId) : undefined
  const progress = jobs.length > 0 ? Math.min(100, Math.round((index / jobs.length) * 100)) : 0

  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-zinc-900">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Katalog-Render-Studio</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Rendert alle Produkte und Farbvarianten aus 4 Richtungen, lädt sie in den Blob-Speicher und erzeugt das
          Manifest für das PDF-Magazin.
        </p>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={start}
            disabled={status === "running" || status === "saving"}
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {status === "idle" ? "Rendering starten" : status === "running" ? "Läuft …" : "Erneut starten"}
          </button>
          <div className="text-sm tabular-nums text-zinc-600">
            {index} / {jobs.length} ({progress}%)
          </div>
          {status === "done" && (
            <a href="/katalog" className="text-sm font-medium text-emerald-700 underline">
              Zum Katalog →
            </a>
          )}
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-300">
          <div className="h-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Live-Renderbühne */}
          <div className="overflow-hidden rounded-lg border border-zinc-300 bg-white">
            <div className="border-b border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-500">
              {currentJob ? (
                <>
                  {item?.name} — {currentJob.view} — {currentJob.color}
                </>
              ) : (
                "—"
              )}
            </div>
            <div className="flex items-center justify-center bg-zinc-50 p-2">
              {status === "running" && currentJob && item ? (
                <div style={{ width: 420, height: 420 }} className="overflow-hidden">
                  <div
                    style={{
                      width: CAPTURE_SIZE,
                      height: CAPTURE_SIZE,
                      transform: `scale(${420 / CAPTURE_SIZE})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <CaptureScene
                      key={currentJob.jobId}
                      preset={item.preset}
                      colorGerman={currentJob.colorGerman}
                      view={currentJob.view}
                      size={CAPTURE_SIZE}
                      onCapture={handleCapture}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex h-[420px] w-[420px] items-center justify-center text-sm text-zinc-400">
                  {status === "done" ? "Fertig" : status === "saving" ? "Speichere …" : "Bereit"}
                </div>
              )}
            </div>
          </div>

          {/* Protokoll */}
          <div className="overflow-hidden rounded-lg border border-zinc-300 bg-zinc-900">
            <div className="border-b border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-400">Protokoll</div>
            <pre className="h-[460px] overflow-auto p-3 text-[11px] leading-relaxed text-emerald-300">
              {log.join("\n")}
            </pre>
          </div>
        </div>
      </div>
    </main>
  )
}
