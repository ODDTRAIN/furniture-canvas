import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ShoppingBag, Plus, Minus, Trash2, Check, Box } from 'lucide-react'
import { useStore } from '../store/useStore'

// ASSETS 데이터
const ASSETS = {
  images: {
    product: [
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=1000",
    ],
    lifestyle: [
      "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1000",
    ]
  },
  accessory: {
    name: "Silent Caster Wheels",
    price: 150,
    image: "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&q=80&w=200"
  }
}

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 })
}

const popoverVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
  exit: { opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } }
}

export default function DetailModal() {
  const { activeItem, setActiveItem, addToCart, addToInventory, inventory, removeFromInventory } = useStore()
  
  const [[page, direction], setPage] = useState([0, 0])
  const [galleryMode, setGalleryMode] = useState('product')
  const [showAccessoryPopover, setShowAccessoryPopover] = useState(false)
  const [accessoryCount, setAccessoryCount] = useState(1)
  const [isAccessoryAdded, setIsAccessoryAdded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [saveFeedback, setSaveFeedback] = useState(false)

  const isSavedInInventory = activeItem ? inventory.some(i => i.id === activeItem.id) : false

  const currentImages = ASSETS.images[galleryMode]
  const imageIndex = ((page % currentImages.length) + currentImages.length) % currentImages.length
  const basePrice = activeItem ? parseInt(activeItem.price.replace(/[^0-9]/g, '')) : 0
  const accessoryTotal = isAccessoryAdded ? ASSETS.accessory.price * accessoryCount : 0
  const finalPrice = basePrice + accessoryTotal

  useEffect(() => {
    if (activeItem) {
      setPage([0, 0])
      setGalleryMode('product')
      setIsAccessoryAdded(false)
      setAccessoryCount(1)
      setShowAccessoryPopover(false)
      setSaveFeedback(false)
    }
  }, [activeItem])

  const paginate = (newDirection) => setPage([page + newDirection, newDirection])

  const handleAddToCart = () => {
    const options = isAccessoryAdded ? {
      name: ASSETS.accessory.name,
      price: ASSETS.accessory.price,
      quantity: accessoryCount
    } : null
    addToCart(activeItem, 1, options)
  }

  const handleToggleAsset = () => {
    if (isSavedInInventory) {
      removeFromInventory(activeItem.id)
    } else {
      addToInventory(activeItem)
      setSaveFeedback(true)
      setTimeout(() => setSaveFeedback(false), 1500)
    }
  }

  if (!activeItem) return null

  return (
    <AnimatePresence>
      {activeItem && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveItem(null)}
            className="fixed inset-0 z-40 bg-white/40 backdrop-blur-lg"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-white w-full max-w-6xl h-[85vh] md:h-[800px] rounded-[32px] shadow-2xl pointer-events-auto flex flex-col md:flex-row overflow-hidden border border-white/50"
            >
              
              {/* --- Left Column: Gallery --- */}
              <div 
                className="relative w-full md:w-3/5 h-1/2 md:h-full bg-gray-50 overflow-hidden group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                 {/* Top Toggle */}
                 <div className="absolute top-6 left-0 right-0 flex justify-center z-20">
                    <div className="bg-gray-200/80 backdrop-blur-md p-1 rounded-full flex gap-1">
                      {['product', 'lifestyle'].map((mode) => (
                        <button
                          key={mode}
                          onClick={() => { setGalleryMode(mode); setPage([0, 0]); }}
                          className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                            galleryMode === mode ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Slider */}
                  <AnimatePresence initial={false} custom={direction} mode="popLayout">
                    <motion.img
                      key={`${galleryMode}-${page}`}
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
                    {isHovered && (
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

                  {/* [NEW STANDARD] Dynamic Expanding Pill Indicator */}
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
                            layout // [핵심] 너비 변화 애니메이션 활성화
                            initial={false}
                            animate={{
                              width: isActive ? 24 : 6, // 활성: 긴 알약(24px), 비활성: 작은 점(6px)
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

              {/* --- Right Column (기존 유지) --- */}
              <div className="w-full md:w-2/5 h-1/2 md:h-full flex flex-col bg-white relative">
                <div className="absolute top-6 right-6 z-10">
                  <button onClick={() => setActiveItem(null)} className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500 hover:text-black">
                    <X size={20} />
                  </button>
                </div>

                <div className="px-8 pt-10 pb-6 border-b border-gray-100">
                  <h2 className="text-3xl font-medium tracking-tight text-black mb-2">{activeItem.name}</h2>
                  <AnimatePresence mode="wait">
                    <motion.p 
                      key={finalPrice}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xl text-gray-500 font-light"
                    >
                      ${finalPrice.toLocaleString()}
                    </motion.p>
                  </AnimatePresence>
                </div>

                <div className="flex-1 overflow-y-auto px-8 py-6 relative no-scrollbar">
                  <div className="prose prose-lg text-gray-600 font-light leading-relaxed">
                    <p>{activeItem.description || "Designed for the modern habitat, this piece balances structural integrity with visual weightlessness."}</p>
                  </div>
                  
                  <div className="mt-10 mb-20 relative">
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Customization</p>
                    {isAccessoryAdded ? (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <img src={ASSETS.accessory.image} alt="acc" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <p className="text-sm font-medium text-black">{ASSETS.accessory.name}</p>
                            <p className="text-xs text-gray-500">Qty: {accessoryCount} (+${accessoryTotal})</p>
                          </div>
                        </div>
                        <button onClick={() => setIsAccessoryAdded(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </motion.div>
                    ) : (
                      <div className="relative">
                        <button 
                          onClick={() => setShowAccessoryPopover(!showAccessoryPopover)}
                          className="flex items-center gap-2 text-sm font-medium text-black hover:text-gray-600 transition-colors border border-gray-200 rounded-full px-4 py-2"
                        >
                          <Plus size={16} /> Add Accessory
                        </button>
                        <AnimatePresence>
                          {showAccessoryPopover && (
                            <motion.div
                              variants={popoverVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              className="absolute top-full left-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-30"
                            >
                              <div className="flex gap-3 mb-4">
                                <img src={ASSETS.accessory.image} alt="acc" className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                                <div>
                                  <h4 className="text-sm font-bold text-black">{ASSETS.accessory.name}</h4>
                                  <p className="text-sm text-gray-500">+${ASSETS.accessory.price}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1 mb-3">
                                <button onClick={() => setAccessoryCount(Math.max(1, accessoryCount - 1))} className="p-2 hover:bg-white rounded-md transition-colors disabled:opacity-50" disabled={accessoryCount <= 1}><Minus size={14} /></button>
                                <span className="text-sm font-medium w-8 text-center">{accessoryCount}</span>
                                <button onClick={() => setAccessoryCount(accessoryCount + 1)} className="p-2 hover:bg-white rounded-md transition-colors"><Plus size={14} /></button>
                              </div>
                              <button onClick={() => { setIsAccessoryAdded(true); setShowAccessoryPopover(false); }} className="w-full bg-black text-white py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"><Check size={14} /> Confirm</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-white z-10 flex gap-3">
                  <motion.button
                    onClick={handleToggleAsset}
                    animate={{
                      backgroundColor: saveFeedback ? '#000000' : (isSavedInInventory ? '#f3f4f6' : '#ffffff'),
                      color: saveFeedback ? '#ffffff' : (isSavedInInventory ? '#000000' : '#4b5563'),
                      borderColor: saveFeedback ? '#000000' : '#e5e7eb'
                    }}
                    transition={{ duration: 0.2 }}
                    className={`
                      flex items-center justify-center gap-2 px-6 py-4 rounded-full font-medium transition-all active:scale-95 border border-gray-200
                      hover:border-gray-400 hover:text-black
                    `}
                    title="Save to ODT SPACE Assets"
                  >
                    {saveFeedback ? (
                      <>
                        <Check size={20} />
                        <span className="text-sm whitespace-nowrap">Saved!</span>
                      </>
                    ) : (
                      <>
                        <Box size={20} className={isSavedInInventory ? "fill-black" : ""} />
                        <span className="text-sm whitespace-nowrap">
                          {isSavedInInventory ? "Saved" : "Save Asset"}
                        </span>
                      </>
                    )}
                  </motion.button>

                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-black text-white py-4 rounded-full font-medium tracking-wide hover:bg-gray-800 transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                  >
                    <ShoppingBag size={18} />
                    <span>Add to Cart &mdash; ${finalPrice.toLocaleString()}</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}