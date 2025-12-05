import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function CartDrawer() {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity } = useStore()

  // 총 가격 계산
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      // "$1,200" 문자열에서 숫자만 추출
      const basePrice = typeof item.price === 'string' 
        ? parseInt(item.price.replace(/[^0-9]/g, '')) 
        : item.price
      
      const optionPrice = item.selectedOptions ? (item.selectedOptions.price * item.selectedOptions.quantity) : 0
      
      return total + ((basePrice + optionPrice) * item.quantity)
    }, 0)
  }, [cart])

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* 배경 흐림 처리 (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
          />

          {/* 오른쪽에서 나오는 서랍 (Drawer) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[70] w-full md:w-[500px] bg-white/90 backdrop-blur-2xl shadow-2xl flex flex-col"
          >
            
            {/* 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                <h2 className="text-lg font-medium tracking-tight">Your Bag ({cart.length})</h2>
              </div>
              <button 
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 장바구니 목록 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="font-light">Your bag is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4">
                    {/* 썸네일 (임시) */}
                    <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center text-gray-400 text-xs">
                       IMG
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-black">{item.name}</h3>
                          <p className="font-medium text-black">{item.price}</p>
                        </div>
                        
                        {/* 옵션 표시 */}
                        {item.selectedOptions && (
                          <p className="text-xs text-gray-500 mt-1">
                            + {item.selectedOptions.name} (x{item.selectedOptions.quantity})
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* 수량 조절 */}
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, -1)}
                            className="p-1 hover:bg-white rounded-md transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, 1)}
                            className="p-1 hover:bg-white rounded-md transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* 삭제 버튼 */}
                        <button 
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 하단 결제 버튼 */}
            <div className="p-6 border-t border-gray-100 bg-white/50">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-light">Subtotal</span>
                <span className="text-2xl font-medium tracking-tight">${subtotal.toLocaleString()}</span>
              </div>
              <button className="w-full bg-black text-white py-4 rounded-full font-medium tracking-wide hover:bg-gray-800 transition-transform active:scale-95 flex items-center justify-center gap-2 group">
                <span>Checkout</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}