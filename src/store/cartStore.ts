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
  validateCart: (availableProducts: Product[]) => void

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
      validateCart: (availableProducts: Product[]) => {
        const { items } = get()
        console.log('validateCart called — cart items:', items.length, 'available products:', availableProducts.length)

        if (items.length === 0) {    
          console.log('Cart is empty — skipping')
          return
        }
        const validItems = items.filter(cartItem => {
          // Check product still exists
          const product = availableProducts.find(
            p => String(p.id) === String(cartItem.product.id)
          )
          if (!product) {
            console.log('Product removed from backend:', cartItem.product.name)
             return false
          }

          // Check variant still exists
          const variant = product.variants.find(
            v => String(v.id) === String(cartItem.variant.id)
          )
          if (!variant) {      
            console.log('Variant removed from backend:', cartItem.variant.color, cartItem.variant.size)
            return false
          }
          // Check variant still has stock
          if (variant.stock <= 0) {
            console.log('Variant out of stock:', cartItem.variant.color, cartItem.variant.size)
            return false
          }
          return true
        })
        console.log('Valid items after validation:', validItems.length)

        // Only update if something was removed
        if (validItems.length !== items.length) {
          console.log('Updating cart — removing', items.length - validItems.length, 'items')

          set({ items: validItems })
        }
      },
    }),
    
    { name: 'shoes-cart' }
  )
)

// Selectors (use these in components instead of inline math)
export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.product.price * i.quantity, 0)

export const cartItemCount = (items: CartItem[]) =>
  items.reduce((s, i) => s + i.quantity, 0)