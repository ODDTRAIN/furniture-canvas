import React, { useMemo, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import FurnitureItem from './FurnitureItem'
import { useStore } from '../store/useStore'

const FURNITURE_DATA = [
  { id: 1, category: 'Sofa', name: 'Modular Sofa 01', price: '$2,400', modelUrl: '/models/chair.glb' },
  { id: 2, category: 'Chair', name: 'Lounge Chair X', price: '$1,200', modelUrl: '/models/chair.glb' },
  { id: 3, category: 'Table', name: 'Coffee Table Y', price: '$850', modelUrl: '/models/chair.glb' },
  { id: 4, category: 'Lamp', name: 'Floor Lamp Z', price: '$450', modelUrl: '/models/chair.glb' },
  { id: 5, category: 'Storage', name: 'Sideboard Alpha', price: '$3,200', modelUrl: '/models/chair.glb' },
  { id: 6, category: 'Chair', name: 'Dining Chair B', price: '$600', modelUrl: '/models/chair.glb' },
]

// [최적화 컴포넌트] 디자인은 건드리지 않고, '화면에 보일 때만 렌더링'하는 기능만 수행
const OptimizedGridItem = ({ item, animateState, transition, isHero }) => {
  const ref = useRef(null)
  // 화면에 나타나기 200px 전부터 미리 로딩하여 끊김 방지
  const isInView = useInView(ref, { margin: "200px 0px 200px 0px", once: false })

  return (
    <motion.div 
      layout
      ref={ref}
      key={item.id}
      animate={animateState}
      transition={transition}
      className="relative w-full aspect-square group"
    >
      <div className="absolute inset-0 z-10">
        {/* [핵심] 화면에 보일 때만 FurnitureItem(3D)을 그림 */}
        {isInView ? <FurnitureItem item={item} /> : null}
      </div>
      
      {/* 기존 텍스트 레이아웃 유지 */}
      <div className={`
        absolute bottom-4 left-0 right-0 z-0 flex flex-col items-center justify-center text-center transition-all duration-500 
        ${isHero ? 'opacity-0 translate-y-4' : 'opacity-60 group-hover:opacity-100'}
      `}>
        <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">
          {item.id.toString().padStart(2, '0')}
        </p>
        <h3 className="text-xl font-medium tracking-tight text-black mb-1">
          {item.name}
        </h3>
        <p className="text-sm font-light text-gray-500">{item.price}</p>
      </div>
    </motion.div>
  )
}

export default function FurnitureGrid() {
  const { interactingItem, category } = useStore()

  const sortedItems = useMemo(() => {
    if (category === 'All') return FURNITURE_DATA
    return [...FURNITURE_DATA].sort((a, b) => {
      const aMatch = a.category === category
      const bMatch = b.category === category
      if (aMatch && !bMatch) return -1
      if (!aMatch && bMatch) return 1
      return 0
    })
  }, [category])

  return (
    <section 
      // [디자인 복구] 배경 투명, 패딩 등 원래 설정하신 값 그대로 복원
      className="w-full min-h-screen px-4 py-24 md:px-12 transition-colors duration-700 ease-in-out bg-transparent select-none"
    >
      <header 
        className="mb-24 max-w-screen-xl mx-auto transition-all duration-500"
        style={{ 
          opacity: interactingItem ? 0.1 : 1, 
          filter: interactingItem ? 'blur(4px)' : 'none' 
        }}
      >
        {/* [타이틀 복구] Odd Train 오리지널 타이틀 복원 */}
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-black text-center uppercase">
          Odd Train
        </h1>
      </header>

      {/* Grid Container */}
      <motion.div 
        layout 
        className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3 max-w-screen-xl mx-auto min-h-[50vh]"
      >
        {sortedItems.map((item) => {
          const isHero = interactingItem === item.id
          const isCategoryMatch = category === 'All' || item.category === category

          // 기존 애니메이션 로직 유지
          let animateState = {}
          if (interactingItem) {
            if (isHero) {
              animateState = { opacity: 1, scale: 1, filter: 'blur(0px)', zIndex: 50, y: 0 }
            } else {
              animateState = { opacity: 0.2, scale: 0.95, filter: 'blur(4px)', zIndex: 0, y: 0 }
            }
          } else {
            if (isCategoryMatch) {
              animateState = { 
                opacity: 1, scale: 1, filter: 'blur(0px)', 
                y: category === 'All' ? 0 : -15, 
                zIndex: 10, pointerEvents: 'auto'
              }
            } else {
              animateState = { 
                opacity: 0.1, scale: 0.9, filter: 'blur(5px) grayscale(100%)', 
                y: 0, zIndex: 0, pointerEvents: 'none'
              }
            }
          }

          return (
            <OptimizedGridItem 
              key={item.id}
              item={item}
              isHero={isHero}
              animateState={animateState}
              transition={{ 
                duration: 0.7, 
                ease: [0.25, 0.1, 0.25, 1] 
              }}
            />
          )
        })}
      </motion.div>
    </section>
  )
}