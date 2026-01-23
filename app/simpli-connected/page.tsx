"use client"

import Link from "next/link"
import { SiteHeader } from "@/components/site-header"

const categories = [
  {
    id: "buero",
    title: "Büro",
    description: "Professionelle Regallösungen für moderne Arbeitsumgebungen",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: "wohnzimmer",
    title: "Wohnzimmer",
    description: "Stilvolle Aufbewahrung für Ihr Zuhause",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: "kinderzimmer",
    title: "Kinderzimmer",
    description: "Sichere und bunte Lösungen für die Kleinen",
    coverVideo: "/videos/simpli-connected/kinderzimmer-cover.mp4",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "kueche",
    title: "Küche",
    description: "Praktische Organisation für Ihre Küche",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    id: "garage",
    title: "Garage",
    description: "Robuste Systeme für Werkzeug und Zubehör",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
  },
  {
    id: "werkstatt",
    title: "Werkstatt",
    description: "Professionelle Aufbewahrung für Handwerker",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function SimpliConnectedPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simpli Connected</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Entdecken Sie inspirierende Einrichtungsideen für jeden Raum mit unseren modularen Regalsystemen
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/simpli-connected/${category.id}`}
                className="group relative bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col h-full">
                  {/* Video/Icon Preview */}
                  <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-4 group-hover:scale-[1.02] transition-transform duration-300">
                    {category.coverVideo ? (
                      <video
                        src={category.coverVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 text-white">
                          {category.icon}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-col flex-1 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 flex-1">{category.description}</p>
                    <div className="flex items-center justify-center gap-1 text-gray-400 group-hover:text-gray-900 transition-colors">
                      <span className="text-sm font-medium">Galerie ansehen</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
