export interface ColorOption {
  id: string
  name: string
  hex: string
  border: string
}

export interface ShelfElement {
  id: string
  type: "ladder" | "shelf" | "surface" | "box"
  name: string
  price: number
  width?: number
  height?: number
  x?: number
  y?: number
  color?: ColorOption
  image?: string
  hasMiddleShelf?: boolean
}

export interface ShelfConfig {
  elements: ShelfElement[]
  totalPrice: number
  hasFeet: boolean
}
