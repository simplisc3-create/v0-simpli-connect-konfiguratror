import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { CategoryGalleryClient } from "./category-gallery-client"

const categoryData: Record<string, { title: string; description: string }> = {
  buero: {
    title: "Büro",
    description: "Professionelle Regallösungen für moderne Arbeitsumgebungen",
  },
  wohnzimmer: {
    title: "Wohnzimmer",
    description: "Stilvolle Aufbewahrung für Ihr Zuhause",
  },
  kinderzimmer: {
    title: "Kinderzimmer",
    description: "Sichere und bunte Lösungen für die Kleinen",
  },
  kueche: {
    title: "Küche",
    description: "Praktische Organisation für Ihre Küche",
  },
  garage: {
    title: "Garage",
    description: "Robuste Systeme für Werkzeug und Zubehör",
  },
  werkstatt: {
    title: "Werkstatt",
    description: "Professionelle Aufbewahrung für Handwerker",
  },
}

export default async function CategoryGalleryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const data = categoryData[category]

  if (!data) {
    return (
      <main className="min-h-screen bg-white">
        <SiteHeader />
        <div className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Kategorie nicht gefunden</h1>
            <Link href="/simpli-connected" className="text-gray-600 hover:text-gray-900">
              Zurück zur Übersicht
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <CategoryGalleryClient category={category} title={data.title} description={data.description} />
    </main>
  )
}
