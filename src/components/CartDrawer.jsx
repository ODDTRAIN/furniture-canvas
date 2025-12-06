import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, FileText } from 'lucide-react'
import { useStore } from '../store/useStore'
import jsPDF from 'jspdf'

export default function CartDrawer() {
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity } = useStore()

  // 총 가격 계산
  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const basePrice = typeof item.price === 'string' 
        ? parseInt(item.price.replace(/[^0-9]/g, '')) 
        : item.price
      const optionPrice = item.selectedOptions ? (item.selectedOptions.price * item.selectedOptions.quantity) : 0
      return total + ((basePrice + optionPrice) * item.quantity)
    }, 0)
  }, [cart])

  // PDF 생성 핸들러 (간단한 영수증 형태)
  const handleSavePDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text("ODT LAB - QUOTE", 20, 20)
    
    doc.setFontSize(12)
    let y = 40
    cart.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.name} (x${item.quantity})`, 20, y)
      const price = typeof item.price === 'number' ? item.price : parseInt(item.price.replace(/[^0-9]/g, ''))
      doc.text(`${price.toLocaleString()} KRW`, 150, y)
      y += 10
    })
    
    doc.line(20, y, 190, y)
    y += 15
    doc.setFontSize(16)
    doc.text(`TOTAL: ${subtotal.toLocaleString()} KRW`, 120, y)
    
    doc.save("ODT_Quote.pdf")
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
          />

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
              <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* 리스트 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <ShoppingBag size={48} strokeWidth={1} />
                  <p className="font-light">Your bag is empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} className="flex gap-4">
                    {/* [수정됨] String()으로 감싸서 숫자 ID 오류 방지 */}
                    <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center text-gray-400 text-xs font-mono">
                       {String(item.id).startsWith('custom') ? 'CUSTOM' : 'ITEM'}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-black">{item.name}</h3>
                          <p className="font-medium text-black">
                            {typeof item.price === 'number' ? `₩${item.price.toLocaleString()}` : item.price}
                          </p>
                        </div>
                        {item.selectedOptions && (
                          <p className="text-xs text-gray-500 mt-1">
                            + {item.selectedOptions.name} (x{item.selectedOptions.quantity})
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                          <button onClick={() => updateQuantity(item.cartItemId, -1)} className="p-1 hover:bg-white rounded-md transition-colors disabled:opacity-50" disabled={item.quantity <= 1}><Minus size={14} /></button>
                          <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartItemId, 1)} className="p-1 hover:bg-white rounded-md transition-colors"><Plus size={14} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.cartItemId)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 하단 버튼 그룹 */}
            <div className="p-6 border-t border-gray-100 bg-white/50 space-y-3">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-500 font-light">Subtotal</span>
                <span className="text-2xl font-medium tracking-tight">₩ {subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleSavePDF}
                  className="flex-1 bg-white border border-gray-200 text-black py-4 rounded-full font-medium tracking-wide hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <FileText size={18} />
                  <span>PDF Quote</span>
                </button>
                <button className="flex-[2] bg-black text-white py-4 rounded-full font-medium tracking-wide hover:bg-gray-800 transition-transform active:scale-95 flex items-center justify-center gap-2 group">
                  <span>Checkout</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}