import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// [CRITICAL FIX] 안전한 저장소 래퍼 (Safe Storage Wrapper)
// 용량이 꽉 차도 앱이 뻗지 않도록 예외 처리를 합니다.
const safeLocalStorage = {
  getItem: (name) => {
    try {
      return localStorage.getItem(name);
    } catch (e) {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      // [FIX] 용량 초과 시 에러를 잡아서 앱 충돌 방지
      console.error("❌ STORAGE QUOTA EXCEEDED: 저장 공간이 부족합니다. (이미지 용량이 너무 큼)");
      console.warn("데이터가 저장되지 않았지만, 앱은 계속 실행됩니다.");
      // 필요하다면 여기서 사용자에게 alert('저장 공간이 부족합니다!')를 띄울 수도 있습니다.
    }
  },
  removeItem: (name) => localStorage.removeItem(name),
};

export const useStore = create(
  persist(
    (set, get) => ({
      // =======================================================================
      // [SECTION 1] Global UI & Interaction State (Zone 1)
      // =======================================================================
      interactingItem: null,
      setInteractingItem: (id) => set({ interactingItem: id }),
      
      activeItem: null, 
      setActiveItem: (item) => set({ activeItem: item }),

      category: 'All',
      setCategory: (cat) => set({ category: cat }),

      cursorLabel: null,
      setCursorLabel: (label) => set({ cursorLabel: label }),

      isDockHovered: false,
      setIsDockHovered: (val) => set({ isDockHovered: val }),

      isIntroPlaying: false,
      setIsIntroPlaying: (val) => set({ isIntroPlaying: val }),
      
      activeIntroTab: null, 
      setActiveIntroTab: (tabId) => set({ activeIntroTab: tabId }),

      isCategoryOpen: false,
      setIsCategoryOpen: (val) => set({ isCategoryOpen: val }),

      hasIntroPlayed: false,
      setHasIntroPlayed: (val) => set({ hasIntroPlayed: val }),

      isPageTransition: false,
      setPageTransition: (val) => set({ isPageTransition: val }),

      // =======================================================================
      // [SECTION 2] Zone 2: Configurator State
      // =======================================================================
      introSignal: false,
      setIntroSignal: (val) => set({ introSignal: val }),

      configuratorState: null, 
      saveConfiguratorState: (units, totalPrice) => set({
        configuratorState: { units, totalPrice }
      }),
      clearConfiguratorState: () => set({ configuratorState: null }),

      // =======================================================================
      // [SECTION 3] Cart & Checkout
      // =======================================================================
      cart: [],
      isCartOpen: false,
      isCheckoutOpen: false, 

      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      openCheckout: () => set({ isCheckoutOpen: true, isCartOpen: false }), 
      closeCheckout: () => set({ isCheckoutOpen: false }),

      addToCart: (item, quantity = 1, options = null) => set((state) => {
        const existingItemIndex = state.cart.findIndex((i) => 
          i.id === item.id && JSON.stringify(i.options) === JSON.stringify(options)
        )
        if (existingItemIndex > -1) {
          const newCart = [...state.cart]
          newCart[existingItemIndex].quantity += quantity
          return { cart: newCart, isCartOpen: true }
        } else {
          return { cart: [...state.cart, { ...item, quantity, options }], isCartOpen: true }
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

      // =======================================================================
      // [SECTION 4] Inventory / Assets
      // =======================================================================
      inventory: [],
      addToInventory: (item) => set((state) => {
        if (state.inventory.some((i) => i.id === item.id)) return state
        return { inventory: [...state.inventory, item] }
      }),
      removeFromInventory: (id) => set((state) => ({
        inventory: state.inventory.filter((i) => i.id !== id)
      })),
    }),
    {
      name: 'odt-storage',
      // [FIX] 기본 localStorage 대신 우리가 만든 안전한 safeLocalStorage 사용
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ 
        cart: state.cart, 
        inventory: state.inventory, 
        configuratorState: state.configuratorState,
        hasIntroPlayed: state.hasIntroPlayed 
      }), 
    }
  )
);