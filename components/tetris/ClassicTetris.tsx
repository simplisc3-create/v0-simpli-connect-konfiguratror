"use client"

import { useState, useEffect, useCallback, useRef, Suspense } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Stars } from "@react-three/drei"
import { EffectComposer, Bloom, DepthOfField, Vignette } from "@react-three/postprocessing"
import { Maximize2, Minimize2 } from "lucide-react"
import { getAvailableModuleTypesForWidth, type ModuleType, type ColorKey } from "@/lib/glb-registry"
import * as THREE from "three"

// =============================================================================
// CONSTANTS - Cinematic Wide Tetris
// =============================================================================
const BOARD_WIDTH = 30 // Triple width for cinematic view
const BOARD_HEIGHT = 20
const INITIAL_DROP_TIME = 1000
const MIN_DROP_TIME = 100
const LEVEL_SPEED_DECREASE = 50

// Available 40cm module types for Tetris blocks
const MODULE_TYPES_40: ModuleType[] = getAvailableModuleTypesForWidth(40)

// Colors available for modules
const MODULE_COLORS: ColorKey[] = ["white", "blue", "yellow", "red", "green"]

// Map tetromino types to colors
const TETROMINO_COLORS: Record<string, ColorKey> = {
  I: "blue",
  O: "yellow",
  T: "white",
  S: "green",
  Z: "red",
  J: "blue",
  L: "yellow",
}

// Tetromino shapes - Standard Tetris pieces
const TETROMINOES: Record<string, { shape: number[][] }> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
}

const TETROMINO_KEYS = Object.keys(TETROMINOES)

// Scoring - Original Tetris scoring
const POINTS = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
}

// =============================================================================
// TYPES
// =============================================================================
type Cell = {
  filled: boolean
  moduleType: ModuleType
  color: ColorKey
  isGhost?: boolean
} | null

type Board = Cell[][]

type Piece = {
  shape: number[][]
  x: number
  y: number
  type: string
  moduleType: ModuleType
  color: ColorKey
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================
function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () => Array.from({ length: BOARD_WIDTH }, () => null))
}

function getRandomModuleType(): ModuleType {
  return MODULE_TYPES_40[Math.floor(Math.random() * MODULE_TYPES_40.length)]
}

function getRandomPiece(): Piece {
  const type = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)]
  const tetromino = TETROMINOES[type]
  const color = TETROMINO_COLORS[type]
  const moduleType = getRandomModuleType()

  return {
    shape: tetromino.shape.map((row) => [...row]),
    x: Math.floor((BOARD_WIDTH - tetromino.shape[0].length) / 2),
    y: 0,
    type,
    moduleType,
    color,
  }
}

function rotatePiece(piece: Piece): Piece {
  const rows = piece.shape.length
  const cols = piece.shape[0].length
  const rotated: number[][] = []

  for (let c = 0; c < cols; c++) {
    const newRow: number[] = []
    for (let r = rows - 1; r >= 0; r--) {
      newRow.push(piece.shape[r][c])
    }
    rotated.push(newRow)
  }

  return { ...piece, shape: rotated }
}

function isValidPosition(board: Board, piece: Piece): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.x + x
        const newY = piece.y + y

        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false
        }

        if (newY >= 0 && board[newY][newX]) {
          return false
        }
      }
    }
  }
  return true
}

function mergePieceToBoard(board: Board, piece: Piece): Board {
  const newBoard = board.map((row) => row.map((cell) => (cell ? { ...cell } : null)))

  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const boardY = piece.y + y
        const boardX = piece.x + x
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = {
            filled: true,
            moduleType: piece.moduleType,
            color: piece.color,
          }
        }
      }
    }
  }

  return newBoard
}

function clearLines(board: Board): { newBoard: Board; linesCleared: number } {
  const newBoard = board.filter((row) => row.some((cell) => !cell))
  const linesCleared = BOARD_HEIGHT - newBoard.length

  while (newBoard.length < BOARD_HEIGHT) {
    newBoard.unshift(Array.from({ length: BOARD_WIDTH }, () => null))
  }

  return { newBoard, linesCleared }
}

// =============================================================================
// 3D MODULE COMPONENT - Renders a single GLB module or fallback box
// =============================================================================
const moduleCache = new Map<string, THREE.Group>()

// Color hex values for fallback boxes
const COLOR_HEX: Record<ColorKey, string> = {
  white: "#f5f5f5",
  blue: "#3b82f6",
  yellow: "#eab308",
  red: "#ef4444",
  green: "#22c55e",
}

// Professional Simpli Module - Large scale with realistic details
function FallbackBox({
  color,
  position,
  isGhost = false,
}: {
  color: ColorKey
  position: [number, number, number]
  isGhost?: boolean
}) {
  const hexColor = COLOR_HEX[color]
  const metalColor = "#c0c0c0"
  
  // Large scale for clear visibility - 5x bigger
  const scale = 5.0
  
  return (
    <group position={position}>
      {/* Chrome metal frame - professional industrial look */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[scale * 0.98, scale * 0.98, scale * 0.5]} />
        <meshStandardMaterial
          color={metalColor}
          metalness={0.95}
          roughness={0.05}
          transparent={isGhost}
          opacity={isGhost ? 0.3 : 1}
        />
      </mesh>
      
      {/* Colored panel front - brighter and more visible */}
      <mesh position={[0, 0, scale * 0.26]} castShadow>
        <boxGeometry args={[scale * 0.86, scale * 0.86, 0.1]} />
        <meshStandardMaterial
          color={hexColor}
          emissive={hexColor}
          emissiveIntensity={isGhost ? 0.2 : 0.8}
          transparent={isGhost}
          opacity={isGhost ? 0.3 : 1}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
      
      {/* Colored panel back */}
      <mesh position={[0, 0, -scale * 0.26]} receiveShadow>
        <boxGeometry args={[scale * 0.86, scale * 0.86, 0.1]} />
        <meshStandardMaterial
          color={hexColor}
          emissive={hexColor}
          emissiveIntensity={isGhost ? 0.1 : 0.4}
          transparent={isGhost}
          opacity={isGhost ? 0.3 : 1}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
      
      {/* Glowing neon edges for cinematic effect */}
      {!isGhost && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(scale, scale, scale * 0.42)]} />
          <lineBasicMaterial 
            color="#ffffff" 
            linewidth={3}
            transparent
            opacity={0.8}
          />
        </lineSegments>
      )}
      
      {/* Additional glow point lights for atmosphere */}
      {!isGhost && (
        <pointLight 
          position={[0, 0, scale * 0.3]} 
          intensity={0.5} 
          distance={scale * 2} 
          color={hexColor}
        />
      )}
    </group>
  )
}

// SimpliModule3D - Uses styled boxes that look like Simpli modules
function SimpliModule3D({
  color,
  position,
  isGhost = false,
}: {
  moduleType: ModuleType
  color: ColorKey
  position: [number, number, number]
  isGhost?: boolean
}) {
  return <FallbackBox color={color} position={position} isGhost={isGhost} />
}

// =============================================================================
// 3D TETRIS BOARD
// =============================================================================
function TetrisBoard3D({
  board,
  currentPiece,
  ghostPiece,
}: {
  board: Board
  currentPiece: Piece | null
  ghostPiece: Piece | null
}) {
  const groupRef = useRef<THREE.Group>(null)
  const MODULE_SIZE = 5.5 // Match module scale for proper spacing



  // Center offset
  const offsetX = -(BOARD_WIDTH * MODULE_SIZE) / 2
  const offsetY = -(BOARD_HEIGHT * MODULE_SIZE) / 2

  return (
    <group ref={groupRef}>
      {/* Board frame - dark background */}
      <mesh position={[0, 0, -1.5]} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH * MODULE_SIZE + 2, BOARD_HEIGHT * MODULE_SIZE + 2, 0.5]} />
        <meshStandardMaterial color="#0d1117" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Grid lines - more visible */}
      <group position={[offsetX + MODULE_SIZE / 2, offsetY + MODULE_SIZE / 2, -0.5]}>
        {Array.from({ length: BOARD_HEIGHT + 1 }).map((_, i) => (
          <mesh key={`h-${i}`} position={[BOARD_WIDTH * MODULE_SIZE / 2 - MODULE_SIZE / 2, i * MODULE_SIZE - MODULE_SIZE / 2, 0]}>
            <boxGeometry args={[BOARD_WIDTH * MODULE_SIZE, 0.08, 0.08]} />
            <meshStandardMaterial color="#1a2332" emissive="#1a2332" emissiveIntensity={0.5} />
          </mesh>
        ))}
        {Array.from({ length: BOARD_WIDTH + 1 }).map((_, i) => (
          <mesh key={`v-${i}`} position={[i * MODULE_SIZE - MODULE_SIZE / 2, BOARD_HEIGHT * MODULE_SIZE / 2 - MODULE_SIZE / 2, 0]}>
            <boxGeometry args={[0.08, BOARD_HEIGHT * MODULE_SIZE, 0.08]} />
            <meshStandardMaterial color="#1a2332" emissive="#1a2332" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>

      {/* Placed blocks */}
      {board.map((row, y) =>
        row.map((cell, x) => {
          if (!cell) return null
          const posX = offsetX + x * MODULE_SIZE + MODULE_SIZE / 2
          const posY = offsetY + (BOARD_HEIGHT - 1 - y) * MODULE_SIZE + MODULE_SIZE / 2
          return (
            <Suspense key={`${x}-${y}`} fallback={null}>
              <SimpliModule3D moduleType={cell.moduleType} color={cell.color} position={[posX, posY, 0]} isGhost={cell.isGhost} />
            </Suspense>
          )
        })
      )}

      {/* Ghost piece */}
      {ghostPiece &&
        ghostPiece.shape.map((row, py) =>
          row.map((cell, px) => {
            if (!cell) return null
            const x = ghostPiece.x + px
            const y = ghostPiece.y + py
            if (y < 0) return null
            const posX = offsetX + x * MODULE_SIZE + MODULE_SIZE / 2
            const posY = offsetY + (BOARD_HEIGHT - 1 - y) * MODULE_SIZE + MODULE_SIZE / 2
            return (
              <Suspense key={`ghost-${px}-${py}`} fallback={null}>
                <SimpliModule3D moduleType={ghostPiece.moduleType} color={ghostPiece.color} position={[posX, posY, 0]} isGhost />
              </Suspense>
            )
          })
        )}

      {/* Current piece */}
      {currentPiece &&
        currentPiece.shape.map((row, py) =>
          row.map((cell, px) => {
            if (!cell) return null
            const x = currentPiece.x + px
            const y = currentPiece.y + py
            if (y < 0) return null
            const posX = offsetX + x * MODULE_SIZE + MODULE_SIZE / 2
            const posY = offsetY + (BOARD_HEIGHT - 1 - y) * MODULE_SIZE + MODULE_SIZE / 2
            return (
              <Suspense key={`current-${px}-${py}`} fallback={null}>
                <SimpliModule3D moduleType={currentPiece.moduleType} color={currentPiece.color} position={[posX, posY, 0]} />
              </Suspense>
            )
          })
        )}
    </group>
  )
}

// =============================================================================
// NEXT PIECE PREVIEW 3D
// =============================================================================
function NextPiecePreview3D({ piece }: { piece: Piece | null }) {
  const groupRef = useRef<THREE.Group>(null)
  const MODULE_SIZE = 0.8



  if (!piece) return null

  const shape = piece.shape
  const width = shape[0].length
  const height = shape.length
  const offsetX = -(width * MODULE_SIZE) / 2
  const offsetY = -(height * MODULE_SIZE) / 2

  return (
    <group ref={groupRef}>
      {shape.map((row, py) =>
        row.map((cell, px) => {
          if (!cell) return null
          const posX = offsetX + px * MODULE_SIZE + MODULE_SIZE / 2
          const posY = offsetY + (height - 1 - py) * MODULE_SIZE + MODULE_SIZE / 2
          return (
            <Suspense key={`next-${px}-${py}`} fallback={null}>
              <SimpliModule3D moduleType={piece.moduleType} color={piece.color} position={[posX, posY, 0]} />
            </Suspense>
          )
        })
      )}
    </group>
  )
}

// =============================================================================
// MAIN TETRIS COMPONENT
// =============================================================================
export function ClassicTetris() {
  const [board, setBoard] = useState<Board>(createEmptyBoard)
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<Piece | null>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const dropTimeRef = useRef(INITIAL_DROP_TIME)
  const containerRef = useRef<HTMLDivElement>(null)

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Calculate ghost piece position
  const getGhostPiece = useCallback((): Piece | null => {
    if (!currentPiece) return null

    let ghostY = currentPiece.y
    const ghost = { ...currentPiece, y: ghostY }

    while (isValidPosition(board, { ...ghost, y: ghost.y + 1 })) {
      ghost.y++
    }

    return ghost.y !== currentPiece.y ? ghost : null
  }, [currentPiece, board])

  // Start new game
  const startGame = useCallback(() => {
    setBoard(createEmptyBoard())
    setCurrentPiece(getRandomPiece())
    setNextPiece(getRandomPiece())
    setScore(0)
    setLevel(1)
    setLines(0)
    setGameOver(false)
    setIsPaused(false)
    setIsStarted(true)
    dropTimeRef.current = INITIAL_DROP_TIME
  }, [])

  // Move piece
  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!currentPiece || gameOver || isPaused) return false

      const newPiece = { ...currentPiece, x: currentPiece.x + dx, y: currentPiece.y + dy }

      if (isValidPosition(board, newPiece)) {
        setCurrentPiece(newPiece)
        return true
      }
      return false
    },
    [currentPiece, board, gameOver, isPaused]
  )

  // Rotate piece
  const rotate = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    const rotated = rotatePiece(currentPiece)

    if (isValidPosition(board, rotated)) {
      setCurrentPiece(rotated)
      return
    }

    // Wall kick
    const kicks = [-1, 1, -2, 2]
    for (const kick of kicks) {
      const kicked = { ...rotated, x: rotated.x + kick }
      if (isValidPosition(board, kicked)) {
        setCurrentPiece(kicked)
        return
      }
    }
  }, [currentPiece, board, gameOver, isPaused])

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!currentPiece || gameOver || isPaused) return

    let newY = currentPiece.y
    while (isValidPosition(board, { ...currentPiece, y: newY + 1 })) {
      newY++
    }
    setCurrentPiece({ ...currentPiece, y: newY })
  }, [currentPiece, board, gameOver, isPaused])

  // Lock piece and spawn new one
  const lockPiece = useCallback(() => {
    if (!currentPiece || !nextPiece) return

    const newBoard = mergePieceToBoard(board, currentPiece)
    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)

    setBoard(clearedBoard)

    if (linesCleared > 0) {
      const pointsEarned = (POINTS[linesCleared as keyof typeof POINTS] || 0) * level
      setScore((s) => s + pointsEarned)
      setLines((l) => {
        const newLines = l + linesCleared
        const newLevel = Math.floor(newLines / 10) + 1
        if (newLevel > level) {
          setLevel(newLevel)
          dropTimeRef.current = Math.max(MIN_DROP_TIME, INITIAL_DROP_TIME - (newLevel - 1) * LEVEL_SPEED_DECREASE)
        }
        return newLines
      })
    }

    // Spawn new piece
    const newPiece = nextPiece
    if (!isValidPosition(clearedBoard, newPiece)) {
      setGameOver(true)
      setCurrentPiece(null)
      return
    }

    setCurrentPiece(newPiece)
    setNextPiece(getRandomPiece())
  }, [currentPiece, nextPiece, board, level])

  // Game loop
  useEffect(() => {
    if (!isStarted || gameOver || isPaused || !currentPiece) return

    gameLoopRef.current = setInterval(() => {
      if (!movePiece(0, 1)) {
        lockPiece()
      }
    }, dropTimeRef.current)

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [isStarted, gameOver, isPaused, currentPiece, movePiece, lockPiece])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isStarted) {
        if (e.key === "Enter" || e.key === " ") {
          startGame()
        }
        return
      }

      if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        setIsPaused((p) => !p)
        return
      }

      if (e.key === "f" || e.key === "F") {
        toggleFullscreen()
        return
      }

      if (gameOver) {
        if (e.key === "Enter" || e.key === " ") {
          startGame()
        }
        return
      }

      if (isPaused) return

      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          movePiece(-1, 0)
          break
        case "ArrowRight":
        case "d":
        case "D":
          movePiece(1, 0)
          break
        case "ArrowDown":
        case "s":
        case "S":
          movePiece(0, 1)
          break
        case "ArrowUp":
        case "w":
        case "W":
          rotate()
          break
        case " ":
          hardDrop()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isStarted, gameOver, isPaused, movePiece, rotate, hardDrop, startGame, toggleFullscreen])

  const ghostPiece = getGhostPiece()

  return (
    <div
      ref={containerRef}
      className={`${isFullscreen ? "fixed inset-0 z-50 bg-[#0a0a0a]" : "w-full bg-[#fafafa]"}`}
    >
      <div className="w-full h-full">
        {/* 3D Game Board */}
        <div
          className="relative overflow-hidden w-full h-full"
          style={{
            height: isFullscreen ? "100vh" : "80vh",
            background: "linear-gradient(180deg, #0a1628 0%, #050c1a 100%)",
          }}
        >
          <Canvas 
            camera={{ position: [0, 5, 140], fov: 50 }} 
            gl={{ antialias: true, alpha: false }}
            dpr={[1, 2]}
            shadows
          >
            {/* Professional Cinematic Lighting */}
            <color attach="background" args={["#0a1628"]} />
            <fog attach="fog" args={["#0a1628", 120, 200]} />
            
            <ambientLight intensity={0.5} />
            <directionalLight position={[50, 60, 50]} intensity={2.0} color="#ffffff" castShadow />
            <directionalLight position={[-50, 40, 40]} intensity={1.2} color="#4080ff" />
            <pointLight position={[0, 0, 50]} intensity={3.5} distance={150} color="#60a5fa" />
            <spotLight position={[0, 80, 60]} angle={0.5} penumbra={1} intensity={3} color="#ffffff" castShadow />
            
            {/* Particle stars background */}
            <Stars 
              radius={100} 
              depth={50} 
              count={3000} 
              factor={4} 
              saturation={0.5} 
              fade 
              speed={0.5}
            />
            
            <Suspense fallback={null}>
              <TetrisBoard3D board={board} currentPiece={currentPiece} ghostPiece={ghostPiece} />
            </Suspense>
            
            {/* Post-processing effects */}
            <EffectComposer>
              <Bloom 
                intensity={1.2} 
                luminanceThreshold={0.2} 
                luminanceSmoothing={0.9}
                mipmapBlur
              />
              <DepthOfField 
                focusDistance={0} 
                focalLength={0.02} 
                bokehScale={3}
              />
              <Vignette 
                offset={0.3} 
                darkness={0.7}
              />
            </EffectComposer>
            
            <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
          </Canvas>

          {/* Overlays */}
          {(!isStarted || gameOver || isPaused) && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-10">
              {!isStarted && !gameOver && (
                <>
                  <h2 className="text-3xl font-bold mb-4">SIMPLI TETRIS</h2>
                  <p className="text-gray-400 mb-2">3D Module Edition</p>
                  <p className="text-sm text-gray-500 mb-6">Echte Simpli Connect Module!</p>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    START
                  </button>
                  <div className="mt-8 text-xs text-gray-500 text-center">
                    <p>Pfeiltasten / WASD - Bewegen & Drehen</p>
                    <p>Leertaste - Hard Drop</p>
                    <p>P / ESC - Pause | F - Fullscreen</p>
                  </div>
                </>
              )}

              {isPaused && !gameOver && (
                <>
                  <h2 className="text-3xl font-bold mb-4">PAUSE</h2>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    WEITER
                  </button>
                </>
              )}

              {gameOver && (
                <>
                  <h2 className="text-3xl font-bold mb-2">GAME OVER</h2>
                  <p className="text-2xl mb-4">{score} Punkte</p>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    NOCHMAL
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Fullscreen Button - Always visible */}
        <button
          onClick={toggleFullscreen}
          className={`absolute top-4 right-4 z-20 p-3 rounded-lg transition-all ${
            isFullscreen 
              ? "bg-white/10 hover:bg-white/20 text-white" 
              : "bg-gray-900/80 hover:bg-gray-900 text-white"
          }`}
          title={isFullscreen ? "Fullscreen beenden (F)" : "Fullscreen (F)"}
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>

        {/* Side Panel */}
        <div className={`flex flex-col gap-4 ${isFullscreen ? "absolute top-4 left-4 z-20 text-white" : "mt-4 text-gray-900"}`}>
          {/* Score Display */}
          <div
            className={`p-4 rounded-lg ${isFullscreen ? "bg-white/10 backdrop-blur-sm" : "bg-gray-100"}`}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </div>

          {/* Score */}
          <div className={`p-4 rounded-lg ${isFullscreen ? "bg-white/10" : "bg-gray-100"}`}>
            <div className="text-xs uppercase tracking-wider opacity-60 mb-1">Score</div>
            <div className="text-2xl font-bold tabular-nums">{score}</div>
          </div>

          {/* Level */}
          <div className={`p-4 rounded-lg ${isFullscreen ? "bg-white/10" : "bg-gray-100"}`}>
            <div className="text-xs uppercase tracking-wider opacity-60 mb-1">Level</div>
            <div className="text-2xl font-bold">{level}</div>
          </div>

          {/* Lines */}
          <div className={`p-4 rounded-lg ${isFullscreen ? "bg-white/10" : "bg-gray-100"}`}>
            <div className="text-xs uppercase tracking-wider opacity-60 mb-1">Lines</div>
            <div className="text-2xl font-bold">{lines}</div>
          </div>

          {/* Next Piece */}
          <div className={`p-4 rounded-lg ${isFullscreen ? "bg-white/10" : "bg-gray-100"}`}>
            <div className="text-xs uppercase tracking-wider opacity-60 mb-2">Next</div>
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-black/20">
              <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <Suspense fallback={null}>
                  <NextPiecePreview3D piece={nextPiece} />
                </Suspense>
              </Canvas>
            </div>
          </div>

          {/* Current Module Type */}
          {currentPiece && (
            <div className={`p-4 rounded-lg ${isFullscreen ? "bg-white/10" : "bg-gray-100"}`}>
              <div className="text-xs uppercase tracking-wider opacity-60 mb-1">Modul</div>
              <div className="text-sm font-medium capitalize">{currentPiece.moduleType.replace(/-/g, " ")}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
