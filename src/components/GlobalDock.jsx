import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Home, Box, Layers, Users, ShoppingBag } from 'lucide-react'
import { useStore } from '../store/useStore'

const PAGE_COLORS = {
  '/': '#064e3b',
  '/configurator': '#7f1d1d',
  '/space': '#374151',
  '/vision': '#1e3a8a',
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
  const { toggleCart, cart, setDockHovered } = useStore()
  
  const currentColor = PAGE_COLORS[location.pathname] || '#000000';
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setDockHovered(isHovered);
  }, [isHovered, setDockHovered]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center">
      <motion.div
        layout
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setHoveredTab(null) }}
        initial={{ width: 140, height: 60, borderRadius: 32 }}
        animate={{
          width: isHovered ? 'auto' : 140,
          height: isHovered ? 80 : 60,
          borderRadius: isHovered ? 40 : 32,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25, mass: 1 }}
        style={{
          backgroundColor: "#ffffff",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "visible",
          cursor: "pointer",
          position: "relative"
        }}
      >
        {/* [FINAL FIX] Perfect Loop Orbit Line */}
        <AnimatePresence>
          {!isHovered && (
            <svg 
              className="absolute inset-0 pointer-events-none" 
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
              viewBox="0 0 140 60"
            >
              <motion.path
                d="M 30 0 L 110 0 A 30 30 0 0 1 110 60 L 30 60 A 30 30 0 0 1 30 0 Z"
                fill="none"
                stroke="#1d1d1f"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeOpacity={0.8}
                
                // [핵심] 0.25(선) + 0.75(공백) = 1.0 (정확한 비율 매칭)
                pathLength={1}
                strokeDasharray="0.25 0.75"
                
                // 0 -> -1로 이동 (시계 방향 무한 회전)
                animate={{ strokeDashoffset: [0, -1] }}
                
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  ease: "linear",
                  repeatType: "loop" // 끊김 방지
                }}
              />
            </svg>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {!isHovered ? (
            <motion.div
              key="label"
              initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              className="absolute flex items-center gap-3 whitespace-nowrap"
            >
              <motion.span animate={{ backgroundColor: currentColor }} transition={{ duration: 0.5 }} className="relative inline-flex rounded-full h-2.5 w-2.5 shadow-sm" />
              <span className="text-xs font-bold tracking-[0.15em] text-[#1d1d1f] uppercase">
                {location.pathname === '/' ? 'Showroom' : location.pathname === '/configurator' ? 'Atelier' : location.pathname === '/space' ? 'Space' : 'Vision'}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
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
                          animate={{ opacity: 1, y: -60, scale: 1 }}
                          exit={{ opacity: 0, y: 0, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          className="absolute z-50 pointer-events-none"
                          style={{ left: '50%', x: '-50%' }}
                        >
                          <div 
                            className="relative px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap"
                            style={{ 
                              backgroundColor: "rgba(29, 29, 31, 0.95)",
                              backdropFilter: "blur(10px)",
                              border: "1px solid rgba(255,255,255,0.1)"
                            }}
                          >
                            <span className="text-[10px] font-bold text-white tracking-wider uppercase">{item.label}</span>
                            <div 
                              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" 
                              style={{ backgroundColor: "rgba(29, 29, 31, 0.95)" }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Link to={item.path} onMouseEnter={() => setHoveredTab(item.id)} onMouseLeave={() => setHoveredTab(null)}>
                      <motion.div
                        whileHover={{ scale: 1.25, y: -4 }}
                        whileTap={{ scale: 0.9 }}
                        className={`p-3.5 rounded-full flex items-center justify-center relative transition-all duration-300 ${isActive ? 'bg-[#1d1d1f] text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-white hover:text-black hover:shadow-md'}`}
                      >
                        <item.icon size={20} strokeWidth={2} />
                        {isActive && <motion.span layoutId="dot" className="absolute -bottom-1.5 w-1 h-1 bg-[#1d1d1f] rounded-full" />}
                      </motion.div>
                    </Link>
                  </div>
                )
              })}

              <div className="w-px h-8 bg-gray-200 mx-2" />

              <motion.button 
                whileHover={{ scale: 1.15 }} 
                onClick={toggleCart} 
                className="p-3.5 rounded-full bg-gray-100 text-gray-600 hover:bg-white hover:text-black relative transition-all hover:shadow-md"
              >
                <ShoppingBag size={20} strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}