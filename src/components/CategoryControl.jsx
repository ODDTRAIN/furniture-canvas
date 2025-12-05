import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, X } from 'lucide-react'
import { useStore } from '../store/useStore'

const CATEGORIES = ['All', 'Sofa', 'Chair', 'Table', 'Lamp', 'Storage']

export default function CategoryControl() {
  const { category, setCategory } = useStore()
  const [isOpen, setIsOpen] = useState(false)

  return (
    // [핵심] isOpen일 때 y값을 살짝(20px) 내려서 시각적 무게중심을 맞춤
    <motion.div 
      initial={false}
      animate={{ y: isOpen ? 20 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed left-8 top-1/2 -translate-y-1/2 z-[60] flex flex-col items-start"
    >
      
      {/* 메뉴 리스트 (Absolute로 띄움) */}
      <div className="absolute left-0 bottom-full mb-4 w-40"> 
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }} // 부드러운 퇴장
              className="flex flex-col gap-2 items-start origin-bottom-left"
            >
              {CATEGORIES.map((cat, index) => (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => setCategory(cat)}
                  className={`
                    text-left text-sm px-3 py-1.5 rounded-lg transition-all duration-300 flex items-center gap-2 backdrop-blur-sm
                    ${category === cat 
                      ? 'text-black font-bold bg-white/80 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-white/40'}
                  `}
                >
                  {category === cat && (
                    <motion.span layoutId="activeDot" className="w-1.5 h-1.5 bg-black rounded-full" />
                  )}
                  {cat}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 메인 버튼 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center 
          shadow-xl transition-all duration-300 border relative z-10
          ${isOpen 
            ? 'bg-black text-white border-black' 
            : 'bg-white text-black border-gray-100 hover:border-gray-300'
          }
        `}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <LayoutGrid size={20} strokeWidth={1.5} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  )
}