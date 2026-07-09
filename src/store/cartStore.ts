import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product, Variant } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, variant: Variant, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, variant, quantity = 1) => {
        const existing = get().items.find(
          i => i.product.id === product.id && i.variant.id === variant.id
        )
        if (existing) {
          set(s => ({
            items: s.items.map(i =>
              i.id === existing.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          }))
        } else {
          set(s => ({
            items: [
              ...s.items,
              {
                id: `${product.id}-${variant.id}-${Date.now()}`,
                product,
                variant,
                quantity,
              },
            ],
          }))
        }
      },

      removeItem: id =>
        set(s => ({ items: s.items.filter(i => i.id !== id) })),

      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeItem(id)
          return
        }
        set(s => ({
          items: s.items.map(i => (i.id === id ? { ...i, quantity: qty } : i)),
        }))
      },

      clearCart: () => set({ items: [] }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),
    }),
    { name: 'shoes-cart' }
  )
)

// Selectors (use these in components instead of inline math)
export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.product.price * i.quantity, 0)

export const cartItemCount = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.quantity, 0)