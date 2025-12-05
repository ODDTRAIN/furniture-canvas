import React, { useEffect, useRef } from 'react'
import { motion, useSpring, useMotionValue } from 'framer-motion'
import { useStore } from '../store/useStore'
import { MoveHorizontal, MousePointerClick } from 'lucide-react'

export default function CustomCursor() {
  const { cursorLabel } = useStore()
  
  // 마우스 좌표 추적 (부드러운 움직임을 위해 MotionValue 사용)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  // 쫀득한 스프링 물리 엔진 적용
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const x = useSpring(cursorX, springConfig)
  const y = useSpring(cursorY, springConfig)

  useEffect(() => {
    const moveCursor = (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }
    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [])

  // 커서 라벨이 없으면 숨김
  if (!cursorLabel) return null

  return (
    <motion.div
      style={{ x, y }}
      className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center"
    >
      {/* 커서 옆에 뜨는 말풍선 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 20 }} // 마우스보다 20px 아래에 위치
        exit={{ opacity: 0, scale: 0.5, y: 10 }}
        className="bg-black/80 backdrop-blur-md text-white text-[10px] font-medium px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2 whitespace-nowrap border border-white/10"
      >
        <MoveHorizontal size={10} className="text-gray-300" />
        <span>Drag to Rotate</span>
        <span className="w-px h-2 bg-white/20 mx-0.5"></span> {/* 구분선 */}
        <MousePointerClick size={10} className="text-gray-300" />
        <span>Click Details</span>
      </motion.div>
    </motion.div>
  )
}