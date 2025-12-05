import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function CartControl() {
  const { cart, toggleCart } = useStore()
  
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)
  const [isBumped, setIsBumped] = useState(false)

  useEffect(() => {
    if (totalItems === 0) return
    setIsBumped(true)
    const timer = setTimeout(() => setIsBumped(false), 300)
    return () => clearTimeout(timer)
  }, [totalItems])

  return (
    <motion.button
      onClick={toggleCart}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        fixed top-8 right-8 z-[60] 
        /* 아이콘과 숫자를 가로로 나란히 배치 */
        flex items-center justify-center gap-2
        p-3 rounded-full
        /* 배경 투명 */
        bg-transparent border-none
        /* 호버 시에만 그림자와 블러 효과 */
        hover:bg-white/10 hover:shadow-lg hover:backdrop-blur-sm
        transition-all duration-300
        group
      `}
    >
      {/* 장바구니 아이콘 */}
      <ShoppingBag 
        size={24} 
        strokeWidth={1.5} 
        className="text-black transition-transform duration-300 group-hover:scale-110" 
      />
      
      {/* 숫자 표시: 아이콘 바로 옆에 텍스트로 배치 */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span
            key={totalItems}
            initial={{ opacity: 0, x: -5 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              scale: isBumped ? 1.3 : 1, 
            }}
            exit={{ opacity: 0, x: -5, transition: { duration: 0.1 } }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="text-sm font-bold text-black"
          >
            {totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}