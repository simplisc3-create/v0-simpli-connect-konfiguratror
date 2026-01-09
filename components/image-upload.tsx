"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X } from "lucide-react"

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
  fallbackImage?: string
  alt: string
}

export function ImageUpload({ onImageUpload, fallbackImage, alt }: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Bitte wähle eine Bilddatei aus")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload fehlgeschlagen")
      }

      const data = await response.json()
      setUploadedImage(data.url)
      onImageUpload(data.url)
    } catch (err) {
      setError("Fehler beim Upload. Bitte versuche es erneut.")
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setUploadedImage(null)
    setError(null)
  }

  const imageToDisplay = uploadedImage || fallbackImage

  return (
    <div className="relative w-full h-full group bg-input">
      {imageToDisplay ? (
        <>
          <img
            src={imageToDisplay || "/placeholder.svg"}
            alt={alt}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Bild entfernen"
          >
            <X className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-gray-100 hover:bg-gray-200 transition">
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-xs text-gray-600 text-center px-2">
              {isUploading ? "Wird hochgeladen..." : "Bild hochladen"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
              aria-label="Bild hochladen"
            />
          </label>
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </>
      )}
    </div>
  )
}
