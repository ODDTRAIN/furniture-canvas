import { create } from 'zustand'

export const useStore = create((set) => ({
  // --- 기존 상태 유지 ---
  activeItem: null,
  setActiveItem: (item) => set({ activeItem: item }),
  interactingItem: null,
  setInteractingItem: (id) => set({ interactingItem: id }),
  heroItem: null,
  setHeroItem: (item) => set({ heroItem: item }),
  cursorLabel: null, 
  setCursorLabel: (label) => set({ cursorLabel: label }),

  // --- 장바구니 상태 유지 ---
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

  // --- [NEW] 카테고리 상태 ---
  category: 'All',
  setCategory: (cat) => set({ category: cat }),
}))