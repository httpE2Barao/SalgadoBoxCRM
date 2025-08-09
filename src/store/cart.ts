import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
}

interface CartItem {
  product: Product
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product: Product) => {
        set((state) => {
          const existingItem = state.items.find(item => item.product.id === product.id)
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              )
            }
          }
          return { items: [...state.items, { product, quantity: 1 }] }
        })
      },
      
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter(item => item.product.id !== productId)
        }))
      },
      
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        }))
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        const state = get()
        return state.items.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      },
      
      getItemCount: () => {
        const state = get()
        return state.items.reduce((total, item) => total + item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)