"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { CaptureScene } from "@/components/catalog/capture-scene"
import { buildRenderJobs, getItemById, type RenderJob, type CatalogManifest } from "@/lib/catalog-data"

type Status = "loading" | "idle" | "running" | "saving" | "done" | "error"

const CAPTURE_SIZE = 900
const PER_JOB_TIMEOUT = 14000
const SAVE_EVERY = 12 // Manifest alle N Captures zwischenspeichern (resumierbar)

export default function KatalogStudioPage() {
  const jobs = useMemo(() => buildRenderJobs(), [])
  const [index, setIndex] = useState(0)
  const [status, setStatus] = useState<Status>("loading")
  const [log, setLog] = useState<string[]>([])
  const imagesRef = useRef<Record<string, string>>({})
  const startedRef = useRef(false)
  const capturedForIndexRef = useRef<number>(-1)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sinceSaveRef = useRef(0)
  const autoStartRef = useRef(true)

  const currentJob: RenderJob | undefined = jobs[index]

  const appendLog = useCallback((msg: string) => {
    setLog((l) => [...l.slice(-80), msg])
  }, [])

  const persist = useCallback(async () => {
    try {
      const res = await fetch("/api/katalog/manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: imagesRef.current, merge: true }),
      })
      const d = await res.json()
      appendLog(`zwischengespeichert (${d.count ?? "?"} gesamt)`)
    } catch {
      appendLog("Zwischenspeichern fehlgeschlagen")
    }
  }, [appendLog])

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
          sinceSaveRef.current += 1
          if (sinceSaveRef.current >= SAVE_EVERY) {
            sinceSaveRef.current = 0
            await persist()
          }
        } else {
          appendLog(`ERR ${job.jobId}: ${data.error ?? "unbekannt"}`)
        }
      } catch {
        appendLog(`ERR ${job.jobId}: upload`)
      }
      advance()
    },
    [advance, appendLog, persist],
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

  // Beim Laden: bestehendes Manifest holen, bereits gerenderte Jobs überspringen.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/katalog/manifest", { cache: "no-store" })
        const manifest = (await res.json()) as CatalogManifest
        if (cancelled) return
        imagesRef.current = manifest.images ?? {}
        const done = Object.keys(imagesRef.current).length
        appendLog(`${done} vorhandene Renderings geladen.`)
        setStatus("idle")
      } catch {
        if (!cancelled) setStatus("idle")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [appendLog])

  const start = useCallback(() => {
    if (startedRef.current) return
    startedRef.current = true
    // Beim ersten noch nicht gerenderten Job beginnen
    let startIdx = 0
    while (startIdx < jobs.length && imagesRef.current[jobs[startIdx].jobId]) {
      startIdx++
    }
    setIndex(startIdx)
    setStatus("running")
    appendLog(`Starte bei Job ${startIdx + 1} von ${jobs.length} …`)
  }, [jobs, appendLog])

  // Auto-Start sobald das Manifest geladen ist (robust gegen Sandbox-Neustarts).
  useEffect(() => {
    if (status === "idle" && autoStartRef.current) {
      autoStartRef.current = false
      start()
    }
  }, [status, start])

  // Bereits vorhandene Jobs während des Laufs überspringen.
  useEffect(() => {
    if (status !== "running" || !currentJob) return
    if (imagesRef.current[currentJob.jobId]) {
      advance()
    }
  }, [status, currentJob, advance])

  // Pro Job ein Sicherheits-Timeout, damit die Pipeline nie hängen bleibt.
  useEffect(() => {
    if (status !== "running" || !currentJob) return
    if (imagesRef.current[currentJob.jobId]) return
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

  // Abschluss: finales Manifest speichern.
  useEffect(() => {
    if (status !== "running") return
    if (index < jobs.length) return
    setStatus("saving")
    appendLog(`Speichere Manifest mit ${Object.keys(imagesRef.current).length} Bildern …`)
    fetch("/api/katalog/manifest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: imagesRef.current, merge: true }),
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

  const item = currentJob ? getItemById(currentJob.itemId) : undefined
  const progress = jobs.length > 0 ? Math.min(100, Math.round((index / jobs.length) * 100)) : 0

  return (
    <main className="min-h-screen bg-zinc-100 p-6 text-zinc-900">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-2xl font-semibold">Katalog-Render-Studio</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Rendert alle Produkte und Farbvarianten aus 4 Richtungen, lädt sie in den Blob-Speicher und erzeugt das
          Manifest für das PDF-Magazin. Läufe sind fortsetzbar – bereits erzeugte Bilder werden übersprungen.
        </p>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => {
              startedRef.current = false
              start()
            }}
            disabled={status === "running" || status === "saving" || status === "loading"}
            className="rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {status === "loading"
              ? "Lädt …"
              : status === "running"
                ? "Läuft …"
                : status === "done"
                  ? "Erneut starten"
                  : "Rendering starten"}
          </button>
          <div className="text-sm tabular-nums text-zinc-600">
            {index} / {jobs.length} ({progress}%)
          </div>
          {(status === "done" || status === "idle") && (
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
              {currentJob && item ? (
                <>
                  {item.name} — {currentJob.view} — {currentJob.color}
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
                  {status === "done"
                    ? "Fertig"
                    : status === "saving"
                      ? "Speichere …"
                      : status === "loading"
                        ? "Lädt …"
                        : "Bereit"}
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
