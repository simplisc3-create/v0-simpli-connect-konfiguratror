"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import * as THREE from "three"
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js"

interface ARPreviewButtonProps {
  sceneRef: React.RefObject<THREE.Group | null>
  disabled?: boolean
}

export function ARPreviewButton({ sceneRef, disabled }: ARPreviewButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [arSupported, setArSupported] = useState<boolean | null>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)

  // Check AR support on mount
  useState(() => {
    if (typeof navigator !== "undefined" && "xr" in navigator) {
      ;(navigator as any).xr?.isSessionSupported?.("immersive-ar").then((supported: boolean) => {
        setArSupported(supported)
      })
    }
    // iOS always supports AR QuickLook for USDZ files
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS) {
      setArSupported(true)
    }
  })

  const sanitizeSceneForExport = (scene: THREE.Group): THREE.Group => {
    const clonedScene = scene.clone(true)

    clonedScene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const mesh = object as THREE.Mesh

        // Handle single material or array of materials
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

        materials.forEach((material) => {
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhysicalMaterial ||
            material instanceof THREE.MeshBasicMaterial
          ) {
            // Remove problematic textures that can't be exported
            const textureProperties = [
              "map",
              "normalMap",
              "roughnessMap",
              "metalnessMap",
              "aoMap",
              "emissiveMap",
              "alphaMap",
            ]

            textureProperties.forEach((prop) => {
              const texture = (material as any)[prop] as THREE.Texture | null
              if (texture) {
                const image = texture.image
                // Check if image is not a valid type for GLTFExporter
                if (
                  image &&
                  !(
                    image instanceof HTMLImageElement ||
                    image instanceof HTMLCanvasElement ||
                    image instanceof ImageBitmap ||
                    (typeof OffscreenCanvas !== "undefined" && image instanceof OffscreenCanvas)
                  )
                ) {
                  // Remove the texture - use solid color instead
                  ;(material as any)[prop] = null
                }
              }
            })

            // Ensure material has valid color if no texture
            if (!material.map && material.color) {
              material.needsUpdate = true
            }
          }
        })
      }
    })

    return clonedScene
  }

  const exportToGLB = useCallback(async (): Promise<Blob | null> => {
    if (!sceneRef.current) return null

    const exporter = new GLTFExporter()

    const sanitizedScene = sanitizeSceneForExport(sceneRef.current)

    return new Promise((resolve) => {
      exporter.parse(
        sanitizedScene,
        (result) => {
          if (result instanceof ArrayBuffer) {
            const blob = new Blob([result], { type: "model/gltf-binary" })
            resolve(blob)
          } else {
            // JSON format - convert to string
            const jsonString = JSON.stringify(result)
            const blob = new Blob([jsonString], { type: "model/gltf+json" })
            resolve(blob)
          }
        },
        (error) => {
          console.error("GLB export error:", error)
          resolve(null)
        },
        { binary: true },
      )
    })
  }, [sceneRef])

  const handleARPreview = useCallback(async () => {
    if (!sceneRef.current) return

    setIsExporting(true)

    try {
      const glbBlob = await exportToGLB()
      if (!glbBlob) {
        alert("Fehler beim Exportieren des 3D-Modells")
        return
      }

      const glbUrl = URL.createObjectURL(glbBlob)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

      if (isIOS) {
        // iOS: Use AR QuickLook with USDZ
        // For now, we'll use the GLB directly with a fallback message
        // In production, you'd convert GLB to USDZ server-side
        const arLink = document.createElement("a")
        arLink.rel = "ar"
        arLink.href = glbUrl
        // Add a child image for AR QuickLook badge
        const img = document.createElement("img")
        img.src = ""
        arLink.appendChild(img)
        arLink.click()

        // Cleanup
        setTimeout(() => URL.revokeObjectURL(glbUrl), 60000)
      } else {
        // Android/Desktop: Try WebXR or download GLB for viewing in external app
        if ("xr" in navigator) {
          const xr = (navigator as any).xr
          const supported = await xr?.isSessionSupported?.("immersive-ar")

          if (supported) {
            // Open in new tab with model-viewer or WebXR viewer
            const viewerUrl = `https://modelviewer.dev/editor/?model=${encodeURIComponent(glbUrl)}`
            window.open(viewerUrl, "_blank")
          } else {
            // Fallback: Download GLB file
            downloadGLB(glbBlob)
          }
        } else {
          // No WebXR: Download GLB for external viewer
          downloadGLB(glbBlob)
        }

        // Cleanup after delay
        setTimeout(() => URL.revokeObjectURL(glbUrl), 60000)
      }
    } catch (error) {
      console.error("AR preview error:", error)
      alert("AR-Vorschau konnte nicht gestartet werden")
    } finally {
      setIsExporting(false)
    }
  }, [sceneRef, exportToGLB])

  const downloadGLB = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "simpli-connect-regal.glb"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleARPreview}
        disabled={disabled || isExporting}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 gap-2"
        title="AR-Vorschau - Sehen Sie Ihr Regal in Ihrem Raum"
      >
        <Smartphone className="h-4 w-4" />
        {isExporting ? "Exportiere..." : "AR"}
      </Button>
      <a ref={linkRef} style={{ display: "none" }} />
    </>
  )
}
