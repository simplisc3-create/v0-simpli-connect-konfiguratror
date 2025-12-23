"use client"

import { Html, Line } from "@react-three/drei"
import { useMemo, useState } from "react"
import type { JSX } from "react/jsx-runtime"

type DimensionLabelsProps = {
  totalWidth: number
  totalHeight: number
  depth: number
  offsetX: number
  offsetY: number
  offsetZ: number
  onAddColumn?: () => void
  onRemoveColumn?: () => void
  onAddRow?: () => void
  onRemoveRow?: () => void
  canRemoveColumn?: boolean
  canRemoveRow?: boolean
}

function ResizeButton({
  position,
  direction,
  onClick,
  label,
  isAdd = true,
}: {
  position: [number, number, number]
  direction: "left" | "right" | "up" | "down"
  onClick?: () => void
  label: string
  isAdd?: boolean
}) {
  const [hovered, setHovered] = useState(false)

  const rotation: [number, number, number] = {
    left: [0, 0, Math.PI / 2],
    right: [0, 0, -Math.PI / 2],
    up: [0, 0, 0],
    down: [0, 0, Math.PI],
  }[direction]

  const baseColor = isAdd ? "#10b981" : "#f43f5e"
  const hoverColor = isAdd ? "#34d399" : "#fb7185"
  const glowColor = isAdd ? "#10b98150" : "#f43f5e50"

  return (
    <group position={position}>
      {/* Glow ring when hovered */}
      {hovered && (
        <mesh rotation={rotation}>
          <torusGeometry args={[0.12, 0.015, 16, 32]} />
          <meshBasicMaterial color={glowColor} transparent opacity={0.6} />
        </mesh>
      )}

      {/* Main arrow button */}
      <group rotation={rotation}>
        {/* Circle background */}
        <mesh
          position={[0, 0, -0.01]}
          onClick={(e) => {
            e.stopPropagation()
            onClick?.()
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            document.body.style.cursor = "pointer"
          }}
          onPointerOut={(e) => {
            e.stopPropagation()
            setHovered(false)
            document.body.style.cursor = "auto"
          }}
        >
          <circleGeometry args={[0.08, 32]} />
          <meshStandardMaterial
            color={hovered ? hoverColor : baseColor}
            metalness={0.2}
            roughness={0.3}
            emissive={hovered ? baseColor : "#000000"}
            emissiveIntensity={hovered ? 0.3 : 0}
          />
        </mesh>

        {/* Arrow icon (triangle) */}
        <mesh position={[0, 0.02, 0.01]}>
          <coneGeometry args={[0.035, 0.05, 3]} />
          <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.5} />
        </mesh>
      </group>

      {/* Floating label */}
      <Html
        position={[
          direction === "left" ? -0.15 : direction === "right" ? 0.15 : 0,
          direction === "up" ? 0.15 : direction === "down" ? -0.15 : 0,
          0.1,
        ]}
        center
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`
            rounded-lg px-3 py-1.5 text-xs font-bold shadow-lg transition-all whitespace-nowrap
            ${hovered ? "scale-110 opacity-100" : "scale-100 opacity-80"}
          `}
          style={{
            background: isAdd
              ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
              : "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
            color: "white",
            boxShadow: hovered ? `0 4px 20px ${glowColor}` : "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  )
}

function DimensionLine({
  start,
  end,
  label,
  offset = 0,
  vertical = false,
}: {
  start: [number, number, number]
  end: [number, number, number]
  label: string
  offset?: number
  vertical?: boolean
}) {
  const midPoint: [number, number, number] = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2 + (vertical ? 0 : 0.02),
    (start[2] + end[2]) / 2 + (vertical ? 0 : offset),
  ]

  return (
    <group>
      {/* Main dimension line */}
      <Line points={[start, end]} color="#374151" lineWidth={1.5} dashed={false} />

      {/* End caps */}
      <mesh position={start}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={end}>
        <sphereGeometry args={[0.008, 12, 12]} />
        <meshStandardMaterial color="#374151" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Extension lines */}
      {!vertical ? (
        <>
          <Line
            points={[
              [start[0], start[1], start[2] - 0.05],
              [start[0], start[1], start[2] + 0.02],
            ]}
            color="#9ca3af"
            lineWidth={1}
          />
          <Line
            points={[
              [end[0], end[1], end[2] - 0.05],
              [end[0], end[1], end[2] + 0.02],
            ]}
            color="#9ca3af"
            lineWidth={1}
          />
        </>
      ) : (
        <>
          <Line
            points={[
              [start[0] - 0.05, start[1], start[2]],
              [start[0] + 0.02, start[1], start[2]],
            ]}
            color="#9ca3af"
            lineWidth={1}
          />
          <Line
            points={[
              [end[0] - 0.05, end[1], end[2]],
              [end[0] + 0.02, end[1], end[2]],
            ]}
            color="#9ca3af"
            lineWidth={1}
          />
        </>
      )}

      {/* Label */}
      <Html position={midPoint} center style={{ pointerEvents: "none" }}>
        <div
          className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-md"
          style={{
            border: "1px solid #e5e7eb",
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </div>
      </Html>
    </group>
  )
}

export function DimensionLabels({
  totalWidth,
  totalHeight,
  depth,
  offsetX,
  offsetY,
  offsetZ,
  onAddColumn,
  onRemoveColumn,
  onAddRow,
  onRemoveRow,
  canRemoveColumn = true,
  canRemoveRow = true,
}: DimensionLabelsProps) {
  // Convert to cm for display
  const widthCM = Math.round(totalWidth * 100)
  const heightCM = Math.round(totalHeight * 100)
  const depthCM = Math.round(depth * 100)

  // Calculate shelf boundaries
  const shelfLeft = offsetX
  const shelfRight = offsetX + totalWidth
  const shelfBottom = offsetY
  const shelfTop = offsetY + totalHeight
  const shelfFront = offsetZ + depth
  const shelfBack = offsetZ
  const shelfCenterX = (shelfLeft + shelfRight) / 2
  const shelfCenterY = (shelfBottom + shelfTop) / 2

  const elements = useMemo(() => {
    const els: JSX.Element[] = []

    // Width dimension (front, above floor)
    els.push(
      <DimensionLine
        key="width"
        start={[shelfLeft, 0.01, shelfFront + 0.2]}
        end={[shelfRight, 0.01, shelfFront + 0.2]}
        label={`${widthCM} cm`}
        offset={0.1}
      />,
    )

    // Height dimension (left side)
    els.push(
      <DimensionLine
        key="height"
        start={[shelfLeft - 0.2, shelfBottom, shelfFront]}
        end={[shelfLeft - 0.2, shelfTop, shelfFront]}
        label={`${heightCM} cm`}
        vertical
      />,
    )

    // Depth dimension (right side)
    els.push(
      <DimensionLine
        key="depth"
        start={[shelfRight + 0.2, 0.01, shelfBack]}
        end={[shelfRight + 0.2, 0.01, shelfFront]}
        label={`${depthCM} cm`}
        offset={0.1}
      />,
    )

    // Floor projection (dashed outline)
    els.push(
      <group key="floor-projection">
        <Line
          points={[
            [shelfLeft, 0.001, shelfBack],
            [shelfRight, 0.001, shelfBack],
            [shelfRight, 0.001, shelfFront],
            [shelfLeft, 0.001, shelfFront],
            [shelfLeft, 0.001, shelfBack],
          ]}
          color="#94a3b8"
          lineWidth={1}
          dashed
          dashSize={0.04}
          gapSize={0.02}
        />
      </group>,
    )

    return els
  }, [shelfLeft, shelfRight, shelfBottom, shelfTop, shelfFront, shelfBack, widthCM, heightCM, depthCM])

  return (
    <group>
      {elements}

      {/* Interactive resize buttons - positioned clearly around the shelf */}

      {/* Add column - right side */}
      {onAddColumn && (
        <ResizeButton
          position={[shelfRight + 0.35, shelfCenterY, (shelfFront + shelfBack) / 2]}
          direction="right"
          onClick={onAddColumn}
          label="+ Spalte"
          isAdd
        />
      )}

      {/* Remove column - left side */}
      {onRemoveColumn && canRemoveColumn && (
        <ResizeButton
          position={[shelfLeft - 0.35, shelfCenterY, (shelfFront + shelfBack) / 2]}
          direction="left"
          onClick={onRemoveColumn}
          label="− Spalte"
          isAdd={false}
        />
      )}

      {/* Add row - top */}
      {onAddRow && (
        <ResizeButton
          position={[shelfCenterX, shelfTop + 0.2, (shelfFront + shelfBack) / 2]}
          direction="up"
          onClick={onAddRow}
          label="+ Zeile"
          isAdd
        />
      )}

      {/* Remove row - bottom */}
      {onRemoveRow && canRemoveRow && (
        <ResizeButton
          position={[shelfCenterX, Math.max(shelfBottom - 0.15, 0.1), (shelfFront + shelfBack) / 2]}
          direction="down"
          onClick={onRemoveRow}
          label="− Zeile"
          isAdd={false}
        />
      )}
    </group>
  )
}
