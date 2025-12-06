import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

// [DATA]
const ACCESSORY_DATA = [
  {
    id: 'door-double',
    title: 'Double Door',
    subtitle: 'Signature Walnut Finish',
    price: '₩150,000',
    desc: '완벽한 대칭이 주는 안정감. 북미산 최상급 월넛 베니어(Veneer)를 사용하여 자연스러운 나무결을 그대로 살렸습니다. 소프트 클로징 힌지가 적용되어 소음 없이 부드럽게 닫힙니다. 복잡한 수납물을 가리고 공간의 품격을 높여보세요.',
    images: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=1200"
    ]
  },
  {
    id: 'door-flip',
    title: 'Flip Door',
    subtitle: 'Display & Archive',
    price: '₩150,000',
    desc: '보여주고 싶은 것과 숨기고 싶은 것의 조화. 전면부에는 좋아하는 매거진이나 LP를 디스플레이하고, 안쪽에는 넉넉한 수납공간을 제공합니다. 갤러리 같은 공간 연출을 위한 최고의 선택입니다.',
    images: [
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1595515106967-14348203f1f4?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1522771753035-0a582063f27c?auto=format&fit=crop&q=80&w=1200"
    ]
  },
  {
    id: 'speaker',
    title: 'Hi-Fi Speaker',
    subtitle: 'Acoustic Mesh Module',
    price: '₩150,000',
    desc: '가구가 음악이 되는 순간. 덴마크산 프리미엄 어쿠스틱 패브릭으로 마감된 스피커 모듈입니다. 기존 오디오 기기를 내부에 수납하여 깔끔하게 숨기거나, 모듈 자체가 울림통 역할을 하도록 설계되었습니다.',
    images: [
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1558231908-11f81d184478?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1520116468816-95b69f847357?auto=format&fit=crop&q=80&w=1200"
    ]
  },
  {
    id: 'shelf',
    title: 'Shelf Unit',
    subtitle: 'Modular Layering',
    price: '₩150,000',
    desc: '가장 기본적이면서도 가장 유연한 솔루션. 강화 알루미늄 엣지가 적용된 자작나무 합판 선반입니다. 3cm 간격으로 높이 조절이 가능하여 어떤 오브제든 완벽하게 수납할 수 있습니다.',
    images: [
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=1200",
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=1200"
    ]
  }
]

export default function AccessoryGuideModal({ isOpen, onClose }) {
  const [selectedId, setSelectedId] = useState(ACCESSORY_DATA[0].id)
  const [imgIndex, setImgIndex] = useState(0) 
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    setImgIndex(0)
  }, [selectedId])

  const activeItem = ACCESSORY_DATA.find(item => item.id === selectedId) || ACCESSORY_DATA[0]

  const nextImage = () => {
    setDirection(1)
    setImgIndex((prev) => (prev + 1) % activeItem.images.length)
  }

  const prevImage = () => {
    setDirection(-1)
    setImgIndex((prev) => (prev - 1 + activeItem.images.length) % activeItem.images.length)
  }

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === 'ArrowRight') nextImage()
      if (e.key === 'ArrowLeft') prevImage()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, imgIndex])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[200] bg-white/40 backdrop-blur-lg" />
          
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              // [수정] Zone 1의 DetailModal과 규격 통일 (h-[85vh] md:h-[800px])
              className="bg-white w-full max-w-6xl h-[85vh] md:h-[800px] rounded-[32px] shadow-2xl pointer-events-auto flex overflow-hidden border border-white/50"
            >
              
              {/* 1. [Left Sidebar] Navigation List (25%) */}
              <div className="w-1/4 min-w-[240px] bg-gray-50 border-r border-gray-100 flex flex-col">
                <div className="p-8 border-b border-gray-200 bg-white">
                  <h2 className="text-xl font-black tracking-tighter text-black">ACCESSORY<br/>GUIDE</h2>
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                  {ACCESSORY_DATA.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full text-left px-8 py-5 transition-all flex items-center justify-between group ${selectedId === item.id ? 'bg-white border-y border-gray-100 shadow-sm' : 'hover:bg-gray-100'}`}
                    >
                      <span className={`text-sm font-bold tracking-wide ${selectedId === item.id ? 'text-black' : 'text-gray-400 group-hover:text-gray-600'}`}>
                        {item.title}
                      </span>
                      {selectedId === item.id && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                    </button>
                  ))}
                </div>
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <button onClick={onClose} className="w-full py-4 rounded-xl bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-black hover:text-white hover:border-black transition-all shadow-sm">
                    Close Guide
                  </button>
                </div>
              </div>

              {/* 2. [Right Content] Gallery & Info (75%) */}
              <div className="flex-1 flex flex-col h-full bg-white relative">
                
                {/* [Top] Immersive Image Gallery (60% Height) - Zone 1 스타일 */}
                <div className="h-[60%] relative bg-gray-100 overflow-hidden group">
                  <AnimatePresence initial={false} custom={direction}>
                    <motion.img
                      key={imgIndex}
                      src={activeItem.images[imgIndex]}
                      custom={direction}
                      variants={{
                        enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
                        center: { x: 0, opacity: 1 },
                        exit: (dir) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0 })
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </AnimatePresence>

                  {/* Navigation Arrows (Hover) */}
                  <div className="absolute inset-0 flex items-center justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <button onClick={prevImage} className="p-3 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white rounded-full transition-colors border border-white/20 pointer-events-auto shadow-lg">
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextImage} className="p-3 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white rounded-full transition-colors border border-white/20 pointer-events-auto shadow-lg">
                      <ChevronRight size={24} />
                    </button>
                  </div>

                  {/* Page Indicator */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 pointer-events-none">
                    {activeItem.images.map((_, i) => (
                      <div key={i} className={`h-1 rounded-full transition-all duration-300 shadow-sm ${i === imgIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'}`} />
                    ))}
                  </div>

                  {/* Close Button (Overlay) */}
                  <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/50 hover:bg-white rounded-full transition-colors backdrop-blur-md z-10 text-black">
                    <X size={20} />
                  </button>
                </div>

                {/* [Bottom] Info Area (40% Height) */}
                <div className="h-[40%] px-12 py-10 flex flex-col justify-center bg-white border-t border-gray-100">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <span className="text-xs font-bold text-blue-600 tracking-[0.2em] uppercase mb-2 block">Selected Module</span>
                      <h3 className="text-4xl font-black text-black tracking-tight">{activeItem.title}</h3>
                      <p className="text-lg text-gray-400 font-medium mt-1">{activeItem.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold font-mono tracking-tight">{activeItem.price}</span>
                    </div>
                  </div>
                  
                  <div className="w-12 h-1 bg-black mb-6" />
                  
                  <p className="text-gray-600 leading-relaxed text-sm max-w-2xl line-clamp-3">
                    {activeItem.desc}
                  </p>

                  <div className="mt-auto flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider pt-4">
                    <span>Scroll to explore</span>
                    <ArrowRight size={14} />
                  </div>
                </div>

              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}