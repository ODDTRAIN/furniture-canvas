import { create } from 'zustand'

export const useStore = create((set) => ({
  // ------------------------------------------------
  // [SECTION 1] Global UI & Interaction State
  // ------------------------------------------------
  interactingItem: null,
  setInteractingItem: (id) => set({ interactingItem: id }),
  
  activeItem: null, // 상세 모달용
  setActiveItem: (item) => set({ activeItem: item }),

  category: 'All',
  setCategory: (cat) => set({ category: cat }),

  cursorLabel: null,
  setCursorLabel: (label) => set({ cursorLabel: label }),

  isDockHovered: false,
  setDockHovered: (val) => set({ isDockHovered: val }),

  // ------------------------------------------------
  // [SECTION 2] Configurator State (오류 해결의 핵심!)
  // ------------------------------------------------
  configuratorState: null, 
  
  // [복구 완료] 이 함수가 없어서 에러가 났던 겁니다.
  saveConfiguratorState: (units, totalPrice) => set({
    configuratorState: { units, totalPrice }
  }),

  // ------------------------------------------------
  // [SECTION 3] Cart & Checkout (신규 기능)
  // ------------------------------------------------
  cart: [],
  isCartOpen: false,
  isCheckoutOpen: false, // 체크아웃 모달 상태

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  
  openCheckout: () => set({ isCheckoutOpen: true, isCartOpen: false }), // 카트 닫고 체크아웃 열기
  closeCheckout: () => set({ isCheckoutOpen: false }),

  addToCart: (item, quantity = 1, options = null) => set((state) => {
    // 중복 아이템 체크 (옵션 포함)
    const existingItemIndex = state.cart.findIndex((i) => 
      i.id === item.id && JSON.stringify(i.options) === JSON.stringify(options)
    )

    if (existingItemIndex > -1) {
      const newCart = [...state.cart]
      newCart[existingItemIndex].quantity += quantity
      return { cart: newCart, isCartOpen: true }
    } else {
      return { 
        cart: [...state.cart, { ...item, quantity, options }], 
        isCartOpen: true 
      }
    }
  }),

  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((i) => i.id !== id)
  })),

  updateCartQuantity: (id, delta) => set((state) => ({
    cart: state.cart.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    )
  })),

  // ------------------------------------------------
  // [SECTION 4] Inventory / Assets
  // ------------------------------------------------
  inventory: [],
  addToInventory: (item) => set((state) => {
    if (state.inventory.some((i) => i.id === item.id)) return state
    return { inventory: [...state.inventory, item] }
  }),
  removeFromInventory: (id) => set((state) => ({
    inventory: state.inventory.filter((i) => i.id !== id)
  })),
}))