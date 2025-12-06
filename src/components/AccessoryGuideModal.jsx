import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Layers, Columns, ArrowUp, Speaker } from 'lucide-react'

// [DATA] 4가지 핵심 악세서리 (수정됨)
const ACCESSORY_DATA = [
  {
    id: 'door-double',
    icon: Columns, // 양문형 아이콘
    category: 'Door Module',
    name: 'Double Door',
    price: '₩ 120,000',
    description: 'Achieve perfect symmetry and conceal clutter. Our double doors feature precision-milled handles and soft-close hinges, offering a clean, architectural look that seamlessly blends with the unit structure.',
    features: ['Symmetrical Design', 'Soft-close Hinges', 'Concealed Storage', 'Dust Protection'],
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=1000", // 예시 이미지
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000",
    ]
  },
  {
    id: 'door-flip',
    icon: ArrowUp, // 위로 열리는 아이콘
    category: 'Display Door',
    name: 'Flip Door',
    price: '₩ 145,000',
    description: 'Display your favorite vinyls or magazines while hiding storage behind. The flip-up mechanism glides smoothly and retracts fully, allowing for versatile usage as both a display rack and a cabinet.',
    features: ['Retractable Mechanism', 'Magazine/Vinyl Display', 'Smooth Gliding Rail', 'Dual Functionality'],
    images: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&q=80&w=1000",
    ]
  },
  {
    id: 'speaker',
    icon: Speaker, // 스피커 아이콘
    category: 'Audio Unit',
    name: 'Hi-Fi Speaker',
    price: '₩ 450,000',
    description: 'Seamlessly integrated audio. This module houses a high-fidelity speaker unit covered in premium acoustic fabric. Designed to provide rich, immersive sound without compromising the aesthetic continuity of your furniture.',
    features: ['Integrated Acoustic Design', 'Premium Fabric Grill', 'Bluetooth / WiFi Ready', 'Vibration Dampening'],
    images: [
      "https://images.unsplash.com/photo-1545459720-aac3e5c2d13f?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1524678606372-87139ed0009e?auto=format&fit=crop&q=80&w=1000",
    ]
  },
  {
    id: 'shelf',
    icon: Layers, // 선반 아이콘
    category: 'Component',
    name: 'Extra Shelf',
    price: '₩ 45,000',
    description: 'The fundamental building block. Crafted from premium walnut veneer with a solid birch core, this additional shelf allows you to subdivide space further, perfect for books, small objects, or dense storage needs.',
    features: ['High-grade Walnut Veneer', 'Solid Birch Plywood Core', 'Adjustable Height', 'Load Capacity: 25kg'],
    images: [
      "https://images.unsplash.com/photo-1594040226829-7f2a15e9907c?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1611486212557-88be5ff6f941?auto=format&fit=crop&q=80&w=1000",
    ]
  }
]

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 })
}

export default function AccessoryGuideModal({ isOpen, onClose }) {
  const [activeTabId, setActiveTabId] = useState(ACCESSORY_DATA[0].id)
  const [[page, direction], setPage] = useState([0, 0])
  const [isHovered, setIsHovered] = useState(false)

  const activeItem = ACCESSORY_DATA.find(item => item.id === activeTabId) || ACCESSORY_DATA[0]
  const currentImages = activeItem.images
  const imageIndex = ((page % currentImages.length) + currentImages.length) % currentImages.length

  useEffect(() => {
    setPage([0, 0])
  }, [activeTabId])

  const paginate = (newDirection) => setPage([page + newDirection, newDirection])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[140] bg-white/40 backdrop-blur-lg"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-white w-full max-w-6xl h-[85vh] md:h-[800px] rounded-[32px] shadow-2xl pointer-events-auto flex flex-col md:flex-row overflow-hidden border border-white/50"
            >
              
              {/* --- [Left Column] Gallery --- */}
              <div 
                className="relative w-full md:w-3/5 h-1/2 md:h-full bg-gray-50 overflow-hidden group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                  {/* Image Slider */}
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.img
                      key={`${activeTabId}-${page}`}
                      src={currentImages[imageIndex]}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={1}
                      onDragEnd={(e, { offset, velocity }) => {
                        const swipe = Math.abs(offset.x) * velocity.x
                        if (swipe < -10000) paginate(1)
                        else if (swipe > 10000) paginate(-1)
                      }}
                      className="absolute inset-0 w-full h-full object-cover cursor-grab active:cursor-grabbing"
                    />
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  <AnimatePresence>
                    {isHovered && currentImages.length > 1 && (
                      <>
                        <motion.button 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => paginate(-1)} 
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/70 backdrop-blur-md text-black hover:bg-white hover:scale-110 shadow-lg pointer-events-auto transition-transform z-20"
                        >
                          <ChevronLeft size={24} />
                        </motion.button>
                        <motion.button 
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => paginate(1)} 
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/70 backdrop-blur-md text-black hover:bg-white hover:scale-110 shadow-lg pointer-events-auto transition-transform z-20"
                        >
                          <ChevronRight size={24} />
                        </motion.button>
                      </>
                    )}
                  </AnimatePresence>

                  {/* Dynamic Expanding Pill Indicator */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
                    <div className="flex items-center gap-2 p-2 bg-black/20 backdrop-blur-xl rounded-full">
                      {currentImages.map((_, idx) => {
                        const isActive = idx === imageIndex;
                        return (
                          <motion.button
                            key={idx}
                            onClick={() => {
                              const diff = idx - imageIndex;
                              if (diff !== 0) paginate(diff);
                            }}
                            layout
                            initial={false}
                            animate={{
                              width: isActive ? 24 : 6, 
                              opacity: isActive ? 1 : 0.5,
                              backgroundColor: "#ffffff"
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30
                            }}
                            className="h-1.5 rounded-full cursor-pointer pointer-events-auto"
                          />
                        );
                      })}
                    </div>
                  </div>
              </div>

              {/* --- [Right Column] Details --- */}
              <div className="w-full md:w-2/5 h-1/2 md:h-full flex flex-col bg-white relative">
                
                {/* Close Button */}
                <div className="absolute top-6 right-6 z-10">
                  <button onClick={onClose} className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500 hover:text-black">
                    <X size={20} />
                  </button>
                </div>

                {/* Header */}
                <div className="px-8 pt-12 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded bg-black text-white text-[10px] font-bold uppercase tracking-wider">
                      {activeItem.category}
                    </span>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.h2 
                      key={activeItem.name}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-3xl font-medium tracking-tight text-black mb-1"
                    >
                      {activeItem.name}
                    </motion.h2>
                  </AnimatePresence>
                  <p className="text-lg text-gray-400 font-light">{activeItem.price}</p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6 relative no-scrollbar">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeItem.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="prose prose-lg text-gray-600 font-light leading-relaxed mb-8">
                        <p>{activeItem.description}</p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Key Features</p>
                        <ul className="space-y-2">
                          {activeItem.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Footer (Grid) */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Select Accessory</p>
                  <div className="grid grid-cols-2 gap-2">
                    {ACCESSORY_DATA.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTabId === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTabId(item.id)}
                          className={`
                            px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-2
                            ${isActive 
                              ? 'bg-white border-black text-black shadow-md' 
                              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700'
                            }
                          `}
                        >
                          <Icon size={16} className={isActive ? "stroke-2" : "stroke-1"} />
                          <span className="truncate">{item.name}</span>
                        </button>
                      )
                    })}
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