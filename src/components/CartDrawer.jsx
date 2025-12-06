import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    toggleCart, 
    removeFromCart, 
    updateCartQuantity,
    openCheckout // [핵심] 스토어에서 checkout 여는 함수 가져오기
  } = useStore()

  // 총 금액 계산
  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop (배경 어둡게 처리 & 클릭 시 닫힘) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
          />

          {/* Drawer Panel (우측에서 슬라이드) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-[110] h-full w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} />
                <span className="font-bold text-lg">Your Cart</span>
                <span className="bg-black text-white text-xs px-2 py-1 rounded-full font-medium">
                  {cart.length}
                </span>
              </div>
              <button 
                onClick={toggleCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p>Your cart is empty</p>
                  <button 
                    onClick={toggleCart}
                    className="text-black font-semibold text-sm hover:underline"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <motion.div 
                    layout
                    key={item.id} 
                    className="flex gap-4"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      {/* 이미지가 있으면 표시, 없으면 텍스트 폴백 */}
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-xs">IMG</div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-sm pr-4">{item.name}</h4>
                          <span className="font-mono text-sm">₩{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-500">{item.category}</p>
                        
                        {/* 옵션 정보 (악세서리 등 추가 정보가 있을 경우) */}
                        {item.options && (
                          <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                            + {item.options.name} (x{item.options.quantity})
                          </div>
                        )}
                      </div>

                      {/* Controls (수량 조절 및 삭제) */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                          <button 
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="p-1 hover:bg-white rounded shadow-sm transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="p-1 hover:bg-white rounded shadow-sm transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-white">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-xl font-bold font-mono">₩{total.toLocaleString()}</span>
                </div>
                
                {/* [핵심 수정] 이 버튼이 CheckoutModal을 엽니다 */}
                <button 
                  onClick={openCheckout} 
                  className="w-full py-4 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2 group"
                >
                  Checkout
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  Shipping & taxes calculated at checkout
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}