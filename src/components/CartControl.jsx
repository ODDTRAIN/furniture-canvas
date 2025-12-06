import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useLocation } from 'react-router-dom' // location 추가

export default function CartControl() {
  const { cart, toggleCart } = useStore()
  const location = useLocation() // 현재 페이지 확인
  
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)
  const [isBumped, setIsBumped] = useState(false)

  // [수정] Configurator 페이지에서는 버튼 숨김 (HUD와 겹침 방지)
  const isHidden = location.pathname === '/configurator';

  useEffect(() => {
    if (totalItems === 0) return
    setIsBumped(true)
    const timer = setTimeout(() => setIsBumped(false), 300)
    return () => clearTimeout(timer)
  }, [totalItems])

  if (isHidden) return null; // 여기서 렌더링 막기

  return (
    <motion.button
      onClick={toggleCart}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        fixed top-8 right-8 z-[60] 
        flex items-center justify-center gap-2
        p-3 rounded-full
        bg-transparent border-none
        hover:bg-white/10 hover:shadow-lg hover:backdrop-blur-sm
        transition-all duration-300
        group
      `}
    >
      <ShoppingBag 
        size={24} 
        strokeWidth={1.5} 
        className="text-black transition-transform duration-300 group-hover:scale-110" 
      />
      
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