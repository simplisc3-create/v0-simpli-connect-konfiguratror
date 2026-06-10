"use client"

import useSWR from "swr"
import { ALL_CATALOG_ITEMS, CATALOG_COLORS, type CatalogManifest } from "@/lib/catalog-data"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function KatalogPage() {
  const { data: manifest } = useSWR<CatalogManifest>("/api/katalog/manifest", fetcher)

  const renderedCount = manifest ? Object.keys(manifest.images).length : 0
  const hasRenders = renderedCount > 0
  const generatedAt = manifest?.generatedAt
    ? new Date(manifest.generatedAt).toLocaleString("de-DE", { dateStyle: "long", timeStyle: "short" })
    : null

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#1a1a1a]">
      {/* Hero */}
      <section className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-24 pb-16 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.35em] text-[#1f6f4a]">Produktkatalog &amp; Magazin</p>
        <h1 className="mt-6 font-serif text-6xl leading-none tracking-tight md:text-7xl">
          Simpli-Connect
          <span className="mt-2 block text-3xl font-normal italic text-[#6b6b6b] md:text-4xl">Kollektion 2026</span>
        </h1>
        <p className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-[#33312c]">
          Ein hochwertiges Magazin, das alle {ALL_CATALOG_ITEMS.length} Modelle des modularen Möbelsystems präsentiert –
          jedes als hochwertiges Studio-Rendering, erhältlich in {CATALOG_COLORS.length} Systemfarben, mit
          Inhaltsverzeichnis, Spezifikationen und Seitenzahlen.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="/api/katalog/pdf?download=1"
            className="rounded-full bg-[#1a1a1a] px-8 py-3.5 text-sm font-medium text-[#f7f5f0] transition-colors hover:bg-[#1f6f4a]"
          >
            PDF-Magazin herunterladen
          </a>
          <a
            href="/katalog/studio"
            className="rounded-full border border-[#d8d4cc] px-8 py-3.5 text-sm font-medium text-[#1a1a1a] transition-colors hover:border-[#1f6f4a] hover:text-[#1f6f4a]"
          >
            Render-Studio
          </a>
        </div>

        {/* Status */}
        <div className="mt-8 text-sm text-[#6b6b6b]">
          {!manifest ? (
            <span>Status wird geladen …</span>
          ) : hasRenders ? (
            <span>
              {renderedCount} Renderings verfügbar{generatedAt ? ` · zuletzt erzeugt am ${generatedAt}` : ""}.
            </span>
          ) : (
            <span className="text-[#b4532a]">
              Noch keine Renderings vorhanden. Bitte zuerst im Render-Studio die Bilder erzeugen.
            </span>
          )}
        </div>
      </section>

      {/* Produktübersicht */}
      <section className="border-t border-[#d8d4cc] bg-[#efece4]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="font-serif text-3xl">In dieser Ausgabe</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
            {ALL_CATALOG_ITEMS.map((item) => (
              <div key={item.id} className="flex items-baseline justify-between border-b border-[#d8d4cc] py-2">
                <span className="text-sm text-[#33312c]">{item.name}</span>
                <span className="text-xs uppercase tracking-wider text-[#6b6b6b]">
                  {item.kind === "regal" ? "Regal" : `${item.width} cm`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-10 text-center text-xs uppercase tracking-[0.2em] text-[#6b6b6b]">
        Simpli-Connect · Kollektion 2026
      </footer>
    </main>
  )
}
