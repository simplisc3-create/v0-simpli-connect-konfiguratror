"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  name: string
  artNr: string
  price: number
  quantity: number
  image?: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  addItems: (items: Omit<CartItem, "quantity">[]) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)),
            }
          }
          return { items: [...state.items, { ...item, quantity: 1 }] }
        })
      },
      addItems: (newItems) => {
        set((state) => {
          const updatedItems = [...state.items]
          for (const item of newItems) {
            const existing = updatedItems.find((i) => i.id === item.id)
            if (existing) {
              existing.quantity += 1
            } else {
              updatedItems.push({ ...item, quantity: 1 })
            }
          }
          return { items: updatedItems }
        })
      },
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }))
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
          return
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }))
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "simpli-cart",
    },
  ),
)
