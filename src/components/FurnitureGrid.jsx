import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import FurnitureItem from './FurnitureItem'
import { useStore } from '../store/useStore'

// src/components/FurnitureGrid.jsx

const FURNITURE_DATA = [
  { 
    id: 1, 
    category: 'Sofa', 
    name: 'Modular Sofa 01', 
    price: '$2,400', 
    modelUrl: '/models/chair.glb' // [수정] 일단 의자로 통일!
  },
  { 
    id: 2, 
    category: 'Chair', 
    name: 'Lounge Chair X', 
    price: '$1,200', 
    modelUrl: '/models/chair.glb' 
  },
  { 
    id: 3, 
    category: 'Table', 
    name: 'Coffee Table Y', 
    price: '$850', 
    modelUrl: '/models/chair.glb' // [수정] 일단 의자로 통일!
  },
  { 
    id: 4, 
    category: 'Lamp', 
    name: 'Floor Lamp Z', 
    price: '$450', 
    modelUrl: '/models/chair.glb' // [수정] 일단 의자로 통일!
  },
  { 
    id: 5, 
    category: 'Storage', 
    name: 'Sideboard Alpha', 
    price: '$3,200', 
    modelUrl: '/models/chair.glb' // [수정] 일단 의자로 통일!
  },
  { 
    id: 6, 
    category: 'Chair', 
    name: 'Dining Chair B', 
    price: '$600', 
    modelUrl: '/models/chair.glb' 
  },
]

// ... 나머지 코드는 그대로 ...

export default function FurnitureGrid() {
  const { interactingItem, category } = useStore()

  // [1] 스마트 정렬 (선택된 카테고리를 맨 앞으로)
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
      className="w-full min-h-screen px-4 py-24 md:px-12 transition-colors duration-700 ease-in-out bg-transparent select-none"
    >
      <header 
        className="mb-24 max-w-screen-xl mx-auto transition-all duration-500"
        style={{ 
          opacity: interactingItem ? 0.1 : 1, 
          filter: interactingItem ? 'blur(4px)' : 'none' 
        }}
      >
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-black text-center uppercase">
          Odd Train
        </h1>
      </header>

      {/* Grid Container */}
      <motion.div 
        layout // 그리드 전체 크기 변경 애니메이션
        className="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3 max-w-screen-xl mx-auto min-h-[50vh]"
      >
        {sortedItems.map((item) => {
          const isHero = interactingItem === item.id
          const isBackground = interactingItem && !isHero
          const isCategoryMatch = category === 'All' || item.category === category

          // --- [애니메이션 상태 정의] ---
          let animateState = {}
          
          if (interactingItem) {
            // 드래그 중일 때
            if (isHero) {
              animateState = { opacity: 1, scale: 1, filter: 'blur(0px)', zIndex: 50, y: 0 }
            } else {
              animateState = { opacity: 0.2, scale: 0.95, filter: 'blur(4px)', zIndex: 0, y: 0 }
            }
          } else {
            // 카테고리 필터링 중일 때
            if (isCategoryMatch) {
              // [주인공] 맨 앞으로 오면서 + 위로 살짝 떠오름 (기립 효과)
              animateState = { 
                opacity: 1, 
                scale: 1, 
                filter: 'blur(0px)', 
                y: category === 'All' ? 0 : -15, // 전체보기 아닐 때만 위로 뜸
                zIndex: 10,
                pointerEvents: 'auto'
              }
            } else {
              // [배경] 뒤로 빠지면서 + 작아짐 (공간 내어주기)
              animateState = { 
                opacity: 0.1, 
                scale: 0.9, // 작아지면서 뒤로 물러나는 느낌
                filter: 'blur(5px) grayscale(100%)', 
                y: 0, 
                zIndex: 0,
                pointerEvents: 'none'
              }
            }
          }

          return (
            <motion.div 
              layout // [핵심] 위치 이동 활성화
              key={item.id}
              animate={animateState}
              // [핵심] 위치 이동과 변형이 완벽하게 동기화되는 곡선
              transition={{ 
                duration: 0.7, 
                ease: [0.25, 0.1, 0.25, 1] // iOS 스타일의 부드러운 가감속
              }}
              className="relative w-full aspect-square group"
            >
              <div className="absolute inset-0 z-10">
                <FurnitureItem item={item} />
              </div>
              
              <div className={`
                absolute bottom-4 left-0 right-0 z-0 flex flex-col items-center justify-center text-center transition-all duration-500 
                ${interactingItem ? 'opacity-0 translate-y-4' : 'opacity-60 group-hover:opacity-100'}
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
        })}
      </motion.div>
    </section>
  )
}