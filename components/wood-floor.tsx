"use client"
import { useMemo } from "react"
import * as THREE from "three"

export function WoodFloor() {
  const woodTexture = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 2048
    canvas.height = 2048
    const ctx = canvas.getContext("2d")!

    // Premium oak base color
    ctx.fillStyle = "#c4a574"
    ctx.fillRect(0, 0, 2048, 2048)

    // Herringbone pattern planks
    const plankWidth = 256
    const plankHeight = 64
    const oakColors = [
      "#c9aa79",
      "#bfa06e",
      "#d4b584",
      "#b89a63",
      "#c2a171",
      "#d0ac7a",
      "#bda26c",
      "#c7a876",
      "#b9986a",
      "#cbad7b",
    ]

    // Draw herringbone pattern
    for (let row = 0; row < 40; row++) {
      for (let col = 0; col < 16; col++) {
        const isEvenRow = row % 2 === 0
        const baseX = col * plankWidth
        const baseY = row * plankHeight

        const color = oakColors[Math.floor(Math.random() * oakColors.length)]

        // Draw plank
        ctx.save()
        ctx.fillStyle = color
        ctx.fillRect(baseX, baseY, plankWidth - 1, plankHeight - 1)

        // Natural wood grain - more subtle
        ctx.globalAlpha = 0.15
        for (let i = 0; i < 12; i++) {
          const grainY = baseY + Math.random() * plankHeight
          const grainColor = Math.random() > 0.5 ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)"
          ctx.strokeStyle = grainColor
          ctx.lineWidth = 0.5 + Math.random() * 1
          ctx.beginPath()
          ctx.moveTo(baseX, grainY)

          // Curved grain lines
          const cp1x = baseX + plankWidth * 0.33
          const cp1y = grainY + (Math.random() - 0.5) * 8
          const cp2x = baseX + plankWidth * 0.66
          const cp2y = grainY + (Math.random() - 0.5) * 8
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, baseX + plankWidth, grainY)
          ctx.stroke()
        }

        // Subtle knot occasionally
        if (Math.random() > 0.95) {
          const knotX = baseX + 30 + Math.random() * (plankWidth - 60)
          const knotY = baseY + 10 + Math.random() * (plankHeight - 20)
          const knotSize = 3 + Math.random() * 5

          ctx.globalAlpha = 0.2
          const knotGrad = ctx.createRadialGradient(knotX, knotY, 0, knotX, knotY, knotSize)
          knotGrad.addColorStop(0, "#6b5a45")
          knotGrad.addColorStop(0.5, "#8b7355")
          knotGrad.addColorStop(1, color)
          ctx.fillStyle = knotGrad
          ctx.beginPath()
          ctx.ellipse(knotX, knotY, knotSize, knotSize * 0.7, Math.random() * Math.PI, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.globalAlpha = 1

        // Subtle highlight on plank
        const highlight = ctx.createLinearGradient(baseX, baseY, baseX, baseY + plankHeight)
        highlight.addColorStop(0, "rgba(255,255,255,0.04)")
        highlight.addColorStop(0.3, "rgba(255,255,255,0.02)")
        highlight.addColorStop(0.7, "rgba(0,0,0,0)")
        highlight.addColorStop(1, "rgba(0,0,0,0.03)")
        ctx.fillStyle = highlight
        ctx.fillRect(baseX, baseY, plankWidth - 1, plankHeight - 1)

        // Very subtle gap between planks
        ctx.fillStyle = "rgba(80,60,40,0.3)"
        ctx.fillRect(baseX + plankWidth - 1, baseY, 1, plankHeight)
        ctx.fillRect(baseX, baseY + plankHeight - 1, plankWidth, 1)

        ctx.restore()
      }
    }

    // Add subtle varnish/finish effect
    const varnish = ctx.createLinearGradient(0, 0, 2048, 2048)
    varnish.addColorStop(0, "rgba(255,255,255,0.02)")
    varnish.addColorStop(0.5, "rgba(255,255,255,0)")
    varnish.addColorStop(1, "rgba(255,255,255,0.02)")
    ctx.fillStyle = varnish
    ctx.fillRect(0, 0, 2048, 2048)

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)
    texture.anisotropy = 16
    texture.colorSpace = THREE.SRGBColorSpace

    return texture
  }, [])

  // Enhanced normal map
  const normalMap = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext("2d")!

    // Neutral base
    ctx.fillStyle = "#8080ff"
    ctx.fillRect(0, 0, 1024, 1024)

    // Wood grain normal variation
    for (let row = 0; row < 20; row++) {
      const plankHeight = 32
      const baseY = row * plankHeight

      for (let i = 0; i < 20; i++) {
        const grainY = baseY + Math.random() * plankHeight
        ctx.strokeStyle = `rgb(${128 + (Math.random() - 0.5) * 15}, ${128 + (Math.random() - 0.5) * 10}, 255)`
        ctx.lineWidth = 1 + Math.random()
        ctx.beginPath()
        ctx.moveTo(0, grainY)
        ctx.lineTo(1024, grainY + (Math.random() - 0.5) * 5)
        ctx.stroke()
      }

      // Plank edges
      ctx.strokeStyle = "rgb(120, 120, 255)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, baseY + plankHeight)
      ctx.lineTo(1024, baseY + plankHeight)
      ctx.stroke()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)

    return texture
  }, [])

  // Roughness map for realistic reflections
  const roughnessMap = useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext("2d")!

    // Base roughness (lighter = rougher)
    ctx.fillStyle = "#666666"
    ctx.fillRect(0, 0, 512, 512)

    // Variation in finish
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const size = 2 + Math.random() * 8
      ctx.fillStyle = `rgb(${90 + Math.random() * 40}, ${90 + Math.random() * 40}, ${90 + Math.random() * 40})`
      ctx.fillRect(x, y, size, size * 0.5)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(4, 4)

    return texture
  }, [])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial
        map={woodTexture}
        normalMap={normalMap}
        normalScale={new THREE.Vector2(0.15, 0.15)}
        roughnessMap={roughnessMap}
        roughness={0.55}
        metalness={0.02}
        envMapIntensity={0.6}
      />
    </mesh>
  )
}
