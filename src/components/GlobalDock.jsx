import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Home, Box, Layers, Users, ShoppingBag } from 'lucide-react'

// 1. [설정] 페이지별 점 색상 매핑 (직관적인 짙은 색상)
const PAGE_COLORS = {
  '/': '#064e3b',             // Showroom: 짙은 녹색 (Emerald 900)
  '/configurator': '#7f1d1d', // Atelier: 짙은 붉은색 (Red 900)
  '/space': '#374151',        // Space: 짙은 회색 (Gray 700)
  '/vision': '#1e3a8a',       // Vision: 짙은 푸른색 (Blue 900)
}

const MENU_ITEMS = [
  { id: 'showroom', label: 'Showroom', icon: Home, path: '/' },
  { id: 'configurator', label: 'Atelier', icon: Box, path: '/configurator' },
  { id: 'space', label: 'Space', icon: Layers, path: '/space' },
  { id: 'vision', label: 'Vision', icon: Users, path: '/vision' },
]

export default function GlobalDock() {
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredTab, setHoveredTab] = useState(null)
  const location = useLocation()
  
  // 현재 페이지에 맞는 색상 가져오기 (매핑에 없으면 기본 검정)
  const currentColor = PAGE_COLORS[location.pathname] || '#000000';

  const [isHinting, setIsHinting] = useState(false)

  // 힌트(넛지) 타이머 로직 (기존과 동일)
  useEffect(() => {
    // 3.5초 뒤에 "나 여기 있어요" 신호 보내기
    const hintStartTimer = setTimeout(() => {
      if (!isHovered) setIsHinting(true)
    }, 850)

    // 1.5초 동안 유지 후 복귀
    const hintEndTimer = setTimeout(() => {
      setIsHinting(false)
    }, 1850)

    return () => {
      clearTimeout(hintStartTimer)
      clearTimeout(hintEndTimer)
    }
  }, [isHovered])

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center">
      
      {/* Morphing Container */}
      <motion.div
        layout
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setHoveredTab(null)
        }}
        initial={{ width: 140, height: 60, borderRadius: 32, y: 0 }}
        
        // 2. [핵심] 고급스러운 힌트 애니메이션
        // 옆으로 길어지는 건 최소화하고, 살짝 떠오르면서(y) 그림자를 강조해 "눌러달라"는 느낌을 줌
        animate={{
          width: isHovered ? 'auto' : 140, // 힌트 시 너비 변화는 제거하거나 아주 미세하게만 줌
          height: isHovered ? 80 : 60,
          borderRadius: isHovered ? 40 : 32,
          
          // 힌트 상태일 때: 살짝 위로 뜸(-8px) + 크기 살짝 커짐(1.05배)
          y: isHovered ? 0 : (isHinting ? -5 : 0),
          scale: isHovered ? 1 : (isHinting ? 1.05 : 1),
          
          // 테두리: 힌트 시 진한 검정으로 명확하게
          borderColor: isHinting ? "rgba(0, 0, 0, 0.8)" : "rgba(255, 255, 255, 0.4)",
          
          // 그림자: 평소엔 은은하게, 힌트 시엔 깊고 진하게 (떠있는 느낌)
          boxShadow: isHinting 
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" // 강조된 그림자
            : `inset 0 1px 1px 0 rgba(255, 255, 255, 0.8), 
               inset 0 -4px 15px -5px rgba(0,0,0,0.1), 
               0 20px 50px -10px rgba(0,0,0,0.2)`
        }}
        
        // 쫀득하고 고급스러운 스프링 모션
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25, 
          mass: 1 
        }}
        
        className="relative flex items-center justify-center backdrop-blur-3xl cursor-pointer"
        style={{
          background: "linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.3))",
          borderWidth: "1px",
          borderStyle: "solid",
          // borderColor와 boxShadow는 animate에서 제어
        }}
      >
        
        {/* 평소 상태: 현재 페이지 표시기 (점 색상 적용) */}
        <AnimatePresence>
          {!isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              className="absolute flex items-center gap-3"
            >
              {/* 색상이 바뀌는 점 */}
              <motion.span 
                animate={{ backgroundColor: currentColor }}
                transition={{ duration: 0.5 }} // 색상이 바뀔 때 부드럽게
                className="relative inline-flex rounded-full h-2.5 w-2.5 shadow-sm" 
              />

              <span className="text-xs font-bold tracking-[0.15em] text-[#1d1d1f] uppercase">
                {location.pathname === '/' ? 'Showroom' : 
                 location.pathname === '/configurator' ? 'Atelier' :
                 location.pathname === '/space' ? 'Space' : 'Vision'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 호버 상태: 메뉴 아이콘들 (기존 동일) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(8px)', transition: { duration: 0.15 } }}
              transition={{ delay: 0.05 }}
              className="flex items-center gap-3 px-6"
            >
              {MENU_ITEMS.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <div key={item.id} className="relative flex flex-col items-center group">
                    <AnimatePresence>
                      {hoveredTab === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 0, scale: 0.8 }}
                          animate={{ opacity: 1, y: -50, scale: 1 }}
                          exit={{ opacity: 0, y: 0, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="absolute z-50 pointer-events-none"
                        >
                          <div className="relative px-3 py-1.5 bg-[#1d1d1f] rounded-lg shadow-xl whitespace-nowrap">
                            <span className="text-[10px] font-bold text-white tracking-wider uppercase">
                              {item.label}
                            </span>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1d1d1f] rotate-45" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Link 
                      to={item.path}
                      onMouseEnter={() => setHoveredTab(item.id)}
                      onMouseLeave={() => setHoveredTab(null)}
                    >
                      <motion.div
                        whileHover={{ scale: 1.25, y: -4 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-3.5 rounded-full flex items-center justify-center relative transition-all duration-300 ${
                          isActive 
                            ? 'bg-[#1d1d1f] text-white shadow-lg' 
                            : 'bg-white/30 text-gray-600 hover:bg-white hover:text-black hover:shadow-md'
                        }`}
                      >
                        <item.icon size={20} strokeWidth={2} />
                        {isActive && (
                          <motion.span layoutId="dot" className="absolute -bottom-1.5 w-1 h-1 bg-[#1d1d1f] rounded-full" />
                        )}
                      </motion.div>
                    </Link>
                  </div>
                )
              })}

              <div className="w-px h-8 bg-gradient-to-b from-transparent via-black/10 to-transparent mx-2" />

              <motion.button whileHover={{ scale: 1.15 }} className="p-3.5 rounded-full bg-white/30 text-gray-600 hover:bg-white hover:text-black relative transition-all hover:shadow-md">
                <ShoppingBag size={20} strokeWidth={2} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  )
}