import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, PenTool, ArrowRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useNavigate } from 'react-router-dom' // [FIX] 이동을 위한 훅 임포트

export default function DetailModal() {
  const { activeItem, setActiveItem, addToCart } = useStore()
  const navigate = useNavigate() // [FIX] 네비게이터 정의

  if (!activeItem) return null

  // Storage 카테고리인지 확인
  const isStorage = activeItem.category === 'Storage'

  const handleClose = () => setActiveItem(null)

  const handleAddToCart = () => {
    addToCart(activeItem)
    handleClose()
  }

  // [FIX] Zone 2 (Configurator)로 이동하는 핸들러
  const handleGoToConfigurator = () => {
    setActiveItem(null) // 모달 닫기
    navigate('/configurator') // 페이지 이동
  }

  return (
    <AnimatePresence>
      {activeItem && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]"
          />

          {/* Modal Container */}
          <motion.div
            layoutId={`item-${activeItem.id}`}
            className="fixed inset-0 z-[160] flex items-center justify-center p-4 pointer-events-none"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl pointer-events-auto relative"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 p-2 bg-white/50 backdrop-blur-md rounded-full hover:bg-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Image Section */}
              <div className="w-full h-64 bg-[#F5F5F7] relative flex items-center justify-center">
                {/* 실제 이미지가 있다면 여기에 렌더링, 없다면 3D 모델 캡처본이나 플레이스홀더 */}
                <img 
                  src={`/images/${activeItem.id}.png`} // 예시 이미지 경로
                  alt={activeItem.name}
                  className="w-full h-full object-cover opacity-0" // 이미지가 없으므로 일단 숨김 처리 (배경색만 보임)
                  onError={(e) => e.target.style.display = 'none'} 
                />
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <span className="text-4xl font-black opacity-10">{activeItem.category}</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-8">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-1">
                      {activeItem.category}
                    </h3>
                    <h2 className="text-3xl font-bold text-black tracking-tight">
                      {activeItem.name}
                    </h2>
                  </div>
                  <span className="text-xl font-medium text-black">
                    {activeItem.price}
                  </span>
                </div>

                <p className="text-gray-600 leading-relaxed mb-8 text-sm">
                  This represents the {activeItem.name}, designed for modern living spaces. 
                  Minimalist aesthetics combined with functional versatility.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  
                  {/* 기본: 장바구니 버튼 */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddToCart}
                    className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
                  >
                    <ShoppingCart size={18} />
                    ADD TO CART
                  </motion.button>

                  {/* [핵심 기능] Storage 카테고리일 때만 뜨는 버튼 */}
                  {isStorage && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGoToConfigurator}
                      // 디자인: 검정 버튼과 대비되는 스타일 (회색 배경 or 아웃라인)
                      className="w-full py-4 bg-[#F5F5F7] text-[#0066cc] rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#E5E5EA] transition-colors"
                    >
                      <PenTool size={18} />
                      CUSTOM FURNITURE
                      <ArrowRight size={16} />
                    </motion.button>
                  )}
                  
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}