import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Library, Box, ArrowRight, ZoomIn } from 'lucide-react';
import { COLLECTION_DATA } from './constants';

export default function CollectionModal({ isOpen, onClose, onLoadTemplate, initialTab = 'PRESETS' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedLookbook, setSelectedLookbook] = useState(null);

  // [Effect] 모달이 열릴 때 초기 탭 설정 (Zone 1에서 넘어올 때 Guide 탭 등)
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // ---------------------------------------------------------------------------
  // [Logic] Drag to Scroll (Horizontal)
  // ---------------------------------------------------------------------------
  const scrollRef = useRef(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isDragging, setIsDragging] = useState(false); // 단순 클릭 vs 드래그 구분용

  const handleMouseDown = (e) => {
    setIsDown(true);
    setIsDragging(false); // 일단 클릭으로 시작
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
    // 드래그 상태를 아주 잠시 유지했다가 풀어줌 (onClick 이벤트 방지용)
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDown) return;
    e.preventDefault(); // 텍스트 선택 방지
    setIsDragging(true); // 움직임이 발생했으므로 드래그 상태로 전환
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // 스크롤 속도 조절
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 1. Backdrop (배경 어둡게) */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
          />
          
          {/* 2. Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="fixed inset-0 z-[210] flex items-center justify-center pointer-events-none p-4"
          >
            <div className="bg-[#f5f5f7] w-full max-w-6xl h-[75vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col pointer-events-auto relative border border-white/50">
              
              {/* Header */}
              <div className="relative flex items-center justify-center px-8 py-6 bg-white border-b border-gray-200 shrink-0 select-none">
                {/* Left: Title */}
                <div className="absolute left-8 flex items-center gap-3">
                  <Library size={24} className="text-black" />
                  <h2 className="text-xl font-black tracking-tight text-black hidden md:block">ODT ARCHIVE</h2>
                </div>
                
                {/* Center: Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-full z-10">
                  {['PRESETS', 'LOOKBOOK', 'GUIDE'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                        activeTab === tab ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:text-black'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Right: Close */}
                <button 
                  onClick={onClose} 
                  className="absolute right-8 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content Body */}
              <div className="flex-1 overflow-hidden relative bg-[#f5f5f7]">
                
                {/* --- TAB 1: PRESETS (Horizontal Scroll + Drag) --- */}
                {activeTab === 'PRESETS' && (
                  <>
                    <style>{`
                      .no-scrollbar::-webkit-scrollbar { display: none; }
                      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                    `}</style>

                    <div
                      ref={scrollRef}
                      onMouseDown={handleMouseDown}
                      onMouseLeave={handleMouseLeave}
                      onMouseUp={handleMouseUp}
                      onMouseMove={handleMouseMove}
                      className={`
                        w-full h-full 
                        overflow-x-auto overflow-y-hidden 
                        flex items-center gap-6 px-8 py-8 
                        no-scrollbar 
                        select-none 
                        /* 드래그 중엔 snap 끄고 커서 변경, 놓으면 snap 켜기 */
                        ${isDown ? 'cursor-grabbing' : 'cursor-grab snap-x snap-mandatory scroll-smooth'}
                      `}
                    >
                      {COLLECTION_DATA.templates.map((item, i) => (
                        <motion.div 
                          key={item.id} 
                          initial={{ opacity: 0, x: 50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="
                            snap-center shrink-0 
                            w-[85vw] md:w-[440px] h-full 
                            bg-white rounded-3xl p-6 flex flex-col gap-6 
                            shadow-sm hover:shadow-2xl transition-all duration-500
                            border border-gray-100 hover:border-black/10
                            group
                            select-none
                          "
                        >
                          {/* Image Area */}
                          <div className="w-full flex-1 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden relative">
                             {item.image ? (
                               <img 
                                 src={item.image} 
                                 alt={item.name} 
                                 className="w-full h-full object-contain p-8 mix-blend-multiply transition-transform duration-500 group-hover:scale-105" 
                                 draggable={false} // 이미지 드래그 방지
                               />
                             ) : (
                               <Box size={64} className="text-gray-300" />
                             )}
                             <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          
                          {/* Info Section */}
                          <div className="flex flex-col gap-2 shrink-0">
                            <div className="flex justify-between items-start">
                              <h3 className="text-2xl font-bold text-black tracking-tight">{item.name}</h3>
                              <span className="font-mono text-sm font-bold bg-gray-100 px-3 py-1 rounded-lg">
                                ₩ {item.price.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                              {item.desc}
                            </p>
                          </div>
                          
                          {/* Build Button */}
                          <button 
                            onClick={(e) => {
                              // 드래그 중이었다면 클릭 무시
                              if (isDragging) {
                                e.preventDefault();
                                e.stopPropagation();
                                return;
                              }
                              onLoadTemplate(item); 
                              onClose();
                            }}
                            className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shrink-0 cursor-pointer"
                          >
                            BUILD THIS UNIT <ArrowRight size={16} />
                          </button>
                        </motion.div>
                      ))}
                      {/* Spacer */}
                      <div className="w-2 shrink-0" />
                    </div>
                  </>
                )}

                {/* --- TAB 2: LOOKBOOK (Grid + Lightbox) --- */}
                {activeTab === 'LOOKBOOK' && (
                  <div className="h-full overflow-y-auto p-8 no-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                      {COLLECTION_DATA.lookbook.map((src, i) => (
                        <motion.div 
                          key={i}
                          layoutId={`lookbook-${i}`}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                          onClick={() => setSelectedLookbook(src)}
                          className="rounded-2xl overflow-hidden aspect-[4/3] relative group cursor-zoom-in border border-gray-100 shadow-sm hover:shadow-lg transition-all"
                        >
                          <img src={src} alt="Lifestyle" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" draggable={false} />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                              <ZoomIn size={24} />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- TAB 3: GUIDE --- */}
                {activeTab === 'GUIDE' && (
                  <div className="h-full overflow-y-auto p-8 no-scrollbar">
                    <div className="max-w-3xl mx-auto py-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {COLLECTION_DATA.guide.map((step, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                            className="flex gap-6 items-start bg-white p-6 rounded-2xl border border-gray-100"
                          >
                            <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                              <step.icon size={20} />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Step 0{i+1}</span>
                              <h3 className="text-lg font-bold text-black mb-2">{step.title}</h3>
                              <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      
                      <div className="mt-12 bg-gray-200 rounded-2xl p-12 text-center">
                        <h4 className="font-bold text-black text-xl mb-3">Need Professional Help?</h4>
                        <p className="text-gray-600 mb-6">Our designers can help you configure the perfect unit for your space.</p>
                        <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm shadow-sm hover:shadow-md transition-all">
                          Contact Support
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </motion.div>

          {/* 3. Lightbox Overlay (For Lookbook) */}
          <AnimatePresence>
            {selectedLookbook && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-12"
                onClick={() => setSelectedLookbook(null)}
              >
                <motion.div
                  layoutId={`lookbook-${COLLECTION_DATA.lookbook.indexOf(selectedLookbook)}`} 
                  className="relative max-w-full max-h-full rounded-lg overflow-hidden shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img 
                    src={selectedLookbook} 
                    alt="Full View" 
                    className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
                    draggable={false}
                  />
                  <button 
                    onClick={() => setSelectedLookbook(null)}
                    className="absolute top-4 right-4 bg-white/50 backdrop-blur-md p-2 rounded-full hover:bg-white text-black transition-colors"
                  >
                    <X size={20} />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}