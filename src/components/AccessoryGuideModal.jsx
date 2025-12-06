import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react'

// [DATA] 악세서리 데이터
const ACCESSORY_DATA = [
  {
    id: 'door-double',
    title: 'Double Door Module',
    price: '₩150,000',
    desc: 'Premium walnut veneer finish with soft-closing hinges. Perfect for hiding clutter while maintaining a warm, organic aesthetic.',
    images: [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600",
    ]
  },
  {
    id: 'door-flip',
    title: 'Flip Door System',
    price: '₩150,000',
    desc: 'Magazine rack style flip door. Display your favorite vinyl records or art books on the front, while storing items inside.',
    images: [
      "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1595515106967-14348203f1f4?auto=format&fit=crop&q=80&w=600",
    ]
  },
  {
    id: 'speaker',
    title: 'Hi-Fi Speaker Unit',
    price: '₩150,000',
    desc: 'Integrated audio solution. Wrapped in premium acoustic fabric mesh. Deep bass resonance structure with Bluetooth 5.0 support.',
    images: [
      "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1558231908-11f81d184478?auto=format&fit=crop&q=80&w=600",
    ]
  },
  {
    id: 'shelf',
    title: 'Additional Shelf',
    price: '₩150,000',
    desc: 'Adjustable height shelf. Made of solid birch plywood with reinforced aluminum edges. Supports up to 20kg.',
    images: [
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=600",
    ]
  }
]

const ImageCarousel = ({ images }) => {
  const [idx, setIdx] = useState(0);
  const next = () => setIdx((prev) => (prev + 1) % images.length);
  const prev = () => setIdx((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden group">
      <motion.img 
        key={idx}
        src={images[idx]} 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); prev(); }} className="p-1.5 bg-white/80 rounded-full hover:bg-white shadow-sm"><ChevronLeft size={16}/></button>
        <button onClick={(e) => { e.stopPropagation(); next(); }} className="p-1.5 bg-white/80 rounded-full hover:bg-white shadow-sm"><ChevronRight size={16}/></button>
      </div>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? 'bg-white' : 'bg-white/40'}`} />
        ))}
      </div>
    </div>
  )
}

export default function AccessoryGuideModal({ isOpen, onClose }) {
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
              className="bg-white w-full max-w-4xl max-h-[85vh] rounded-[32px] shadow-2xl pointer-events-auto flex flex-col overflow-hidden border border-white/50"
            >
              <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tight">ACCESSORY GUIDE</h2>
                  <p className="text-sm text-gray-500 font-medium">Discover our premium modular add-ons</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400 hover:text-black"/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-[#f9f9fb]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {ACCESSORY_DATA.map((item) => (
                    <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                      <ImageCarousel images={item.images} />
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-bold text-black">{item.title}</h3>
                          <span className="text-sm font-bold text-gray-400 font-mono">{item.price}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-100 bg-white flex justify-end">
                <button onClick={onClose} className="px-8 py-3 bg-black text-white rounded-full font-bold text-sm hover:bg-gray-800 transition-colors">
                  Close Guide
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}