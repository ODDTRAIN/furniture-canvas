// ... (Previous imports remain the same)
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ShoppingBag, Plus, Minus, Trash2, Check } from 'lucide-react'
import { useStore } from '../store/useStore'

// ... (ASSETS and Variants remain the same)
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

// ... (slideVariants and popoverVariants remain the same)
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
  const { activeItem, setActiveItem, addToCart } = useStore() // Added addToCart
  
  // ... (State logic remains the same)
  const [[page, direction], setPage] = useState([0, 0])
  const [galleryMode, setGalleryMode] = useState('product')
  const [showAccessoryPopover, setShowAccessoryPopover] = useState(false)
  const [accessoryCount, setAccessoryCount] = useState(1)
  const [isAccessoryAdded, setIsAccessoryAdded] = useState(false)

  // ... (Derived state remains the same)
  const currentImages = ASSETS.images[galleryMode]
  const imageIndex = ((page % currentImages.length) + currentImages.length) % currentImages.length
  const basePrice = activeItem ? parseInt(activeItem.price.replace(/[^0-9]/g, '')) : 0
  const accessoryTotal = isAccessoryAdded ? ASSETS.accessory.price * accessoryCount : 0
  const finalPrice = basePrice + accessoryTotal

  // ... (useEffect and paginate remain the same)
  useEffect(() => {
    if (activeItem) {
      setPage([0, 0])
      setGalleryMode('product')
      setIsAccessoryAdded(false)
      setAccessoryCount(1)
      setShowAccessoryPopover(false)
    }
  }, [activeItem])

  const paginate = (newDirection) => setPage([page + newDirection, newDirection])

  // --- NEW HANDLER ---
  const handleAddToCart = () => {
    // Prepare options object if accessory is selected
    const options = isAccessoryAdded ? {
      name: ASSETS.accessory.name,
      price: ASSETS.accessory.price,
      quantity: accessoryCount
    } : null

    addToCart(activeItem, 1, options)
  }

  if (!activeItem) return null

  return (
    <AnimatePresence>
      {activeItem && (
        <>
          {/* ... (Backdrop and Modal Container remain the same) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveItem(null)}
            className="fixed inset-0 z-40 bg-white/40 backdrop-blur-lg"
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-6xl h-[85vh] md:h-[800px] rounded-[32px] shadow-2xl pointer-events-auto flex flex-col md:flex-row overflow-hidden border border-white/50"
            >
              
              {/* ... (Left Column Gallery code remains exactly the same) */}
              <div className="relative w-full md:w-3/5 h-1/2 md:h-full bg-gray-50 overflow-hidden group">
                 {/* (Insert existing gallery code here) */}
                 {/* For brevity, assuming existing gallery code is preserved */}
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
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <button onClick={() => paginate(-1)} className="p-3 rounded-full bg-white/80 backdrop-blur text-black hover:bg-white shadow-lg pointer-events-auto"><ChevronLeft size={24} /></button>
                    <button onClick={() => paginate(1)} className="p-3 rounded-full bg-white/80 backdrop-blur text-black hover:bg-white shadow-lg pointer-events-auto"><ChevronRight size={24} /></button>
                  </div>
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                    {currentImages.map((_, idx) => (
                      <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === imageIndex ? 'w-6 bg-black' : 'w-1.5 bg-black/20'}`} />
                    ))}
                  </div>
              </div>

              {/* Right Column */}
              <div className="w-full md:w-2/5 h-1/2 md:h-full flex flex-col bg-white relative">
                
                {/* Close Button */}
                <div className="absolute top-6 right-6 z-10">
                  <button onClick={() => setActiveItem(null)} className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500 hover:text-black">
                    <X size={20} />
                  </button>
                </div>

                {/* Header */}
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6 relative no-scrollbar">
                  <div className="prose prose-lg text-gray-600 font-light leading-relaxed">
                    <p>{activeItem.description} Designed for the modern habitat, this piece balances structural integrity with visual weightlessness.</p>
                  </div>
                  
                  {/* Accessory Configurator (Preserved) */}
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

                {/* Footer - UPDATED ONCLICK */}
                <div className="p-8 border-t border-gray-100 bg-white z-10">
                  <button 
                    onClick={handleAddToCart}
                    className="w-full bg-black text-white py-4 rounded-full font-medium tracking-wide hover:bg-gray-800 transition-transform active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-black/10"
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