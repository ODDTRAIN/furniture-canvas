import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // --- [Global Interaction] ---
      activeItem: null,
      setActiveItem: (item) => set({ activeItem: item }),
      interactingItem: null,
      setInteractingItem: (id) => set({ interactingItem: id }),
      cursorLabel: null,
      setCursorLabel: (label) => set({ cursorLabel: label }),
      
      // [NEW] Global Dock Hover State (UI 겹침 방지용)
      isDockHovered: false,
      setDockHovered: (isHovered) => set({ isDockHovered: isHovered }),

      // --- [Category State] ---
      category: 'All',
      setCategory: (cat) => set({ category: cat }),

      // --- [Inventory System] ---
      inventory: [],
      addToInventory: (item) => set((state) => {
        const exists = state.inventory.find((i) => i.id === item.id)
        if (exists) return state
        return { inventory: [...state.inventory, { ...item, savedAt: Date.now() }] }
      }),
      removeFromInventory: (itemId) => set((state) => ({
        inventory: state.inventory.filter((i) => i.id !== itemId)
      })),

      // --- [Cart System] ---
      cart: [],
      isCartOpen: false,
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      
      addToCart: (item, quantity = 1, options = null) => set((state) => {
        const cartItemId = options ? `${item.id}-${options.name}` : `${item.id}-base`
        const existingItem = state.cart.find((i) => i.cartItemId === cartItemId)

        if (existingItem) {
          return {
            cart: state.cart.map((i) => 
              i.cartItemId === cartItemId 
                ? { ...i, quantity: i.quantity + quantity } 
                : i
            ),
            isCartOpen: true,
            activeItem: null 
          }
        }
        return {
          cart: [...state.cart, { ...item, cartItemId, quantity, selectedOptions: options }],
          isCartOpen: true,
          activeItem: null
        }
      }),

      removeFromCart: (cartItemId) => set((state) => ({
        cart: state.cart.filter((i) => i.cartItemId !== cartItemId)
      })),

      updateQuantity: (cartItemId, delta) => set((state) => ({
        cart: state.cart.map((i) => {
          if (i.cartItemId === cartItemId) {
            const newQty = i.quantity + delta
            return newQty > 0 ? { ...i, quantity: newQty } : i
          }
          return i
        })
      })),

      // --- [Session Persistence] ---
      configuratorState: {
        units: [],
        totalPrice: 0,
      },
      saveConfiguratorState: (units, totalPrice) => set({
        configuratorState: { units, totalPrice }
      }),
    }),
    {
      name: 'odt-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        cart: state.cart, 
        inventory: state.inventory,
        configuratorState: state.configuratorState 
      }),
    }
  )
)