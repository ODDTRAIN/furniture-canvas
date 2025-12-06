import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Info } from 'lucide-react'

// 악세서리별 실제 이미지 및 설명 데이터 (가라 데이터)
const ACC_INFO = {
  "door-double": {
    title: "Double Door Module",
    desc: "Walnut veneer finish. Perfect for hiding clutter while maintaining a clean aesthetic. Soft-closing hinges included.",
    img: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=400"
  },
  "door-flip": {
    title: "Flip Door System",
    desc: "Magazine rack style flip door. Display your favorite vinyls or books on the front, store items inside.",
    img: "https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&q=80&w=400"
  },
  "speaker": {
    title: "Hi-Fi Speaker Unit",
    desc: "Integrated audio solution. Premium acoustic fabric mesh with deep bass resonance structure.",
    img: "https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&q=80&w=400"
  },
  "shelf": {
    title: "Additional Shelf",
    desc: "Adjustable height shelf. Made of solid birch plywood with reinforced aluminum edges.",
    img: "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&q=80&w=400"
  }
}

export default function AccessoryDetailModal({ isOpen, onClose, accessories }) {
  if (!isOpen) return null

  // 현재 유닛에 포함된 악세서리 종류만 필터링
  const uniqueTypes = [...new Set(Object.values(accessories).map(acc => acc.type))]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-white/40 backdrop-blur-lg"
          />
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl max-h-[80vh] rounded-[24px] shadow-2xl pointer-events-auto flex flex-col overflow-hidden border border-gray-200"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div className="flex items-center gap-2">
                  <Info size={20} className="text-black" />
                  <h3 className="text-lg font-bold text-black uppercase tracking-wide">Accessory Details</h3>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {uniqueTypes.length === 0 ? (
                  <p className="text-center text-gray-400 py-10">No accessories added yet.</p>
                ) : (
                  uniqueTypes.map(type => {
                    const info = ACC_INFO[type] || { title: type, desc: "Detail info coming soon.", img: "" }
                    return (
                      <div key={type} className="flex gap-6 items-start">
                        <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                          <img src={info.img} alt={info.title} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-black mb-2">{info.title}</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{info.desc}</p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}