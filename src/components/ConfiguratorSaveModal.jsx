// ... (기존 import 동일)
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Box, ShoppingBag, Check, FileText, ArrowLeft } from 'lucide-react'
import jsPDF from 'jspdf'

const FONT_URL = '/fonts/Pretendard.ttf';

export default function ConfiguratorSaveModal({ isOpen, onClose, data, onAddToCart, onSaveAsset, capturedImage }) {
  // ... (로직 동일) ...
  const [isSaved, setIsSaved] = useState(false)
  const [mode, setMode] = useState('initial') 
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', remarks: '' })
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSaveClick = () => { onSaveAsset(); setIsSaved(true); setTimeout(() => setIsSaved(false), 1500); }

  const handleGeneratePDF = async () => {
     // ... (PDF 생성 로직 100% 동일 유지) ...
     // (코드 길이상 생략, 이전 답변의 handleGeneratePDF 복붙해서 쓰시면 됩니다)
     // 만약 필요하시면 다시 전체 코드 드릴게요! (핵심은 모달 사이즈 변경이므로 아래 JSX만 수정)
     alert("PDF Generator Logic Here"); 
     onClose();
  };

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
              // [수정] 높이 520px로 컴팩트하게
              className="bg-white w-full max-w-5xl h-[520px] rounded-[32px] shadow-2xl pointer-events-auto flex overflow-hidden border border-white/50"
            >
              {/* ... (내부 컨텐츠 기존과 동일 - 텍스트 크기 키운 버전) ... */}
               {/* Left Column */}
              <div className="w-1/2 bg-[#f5f5f7] relative overflow-hidden flex flex-col">
                {mode === 'quote' ? (
                  <div className="flex-1 p-10 flex flex-col">
                    <button onClick={() => setMode('initial')} className="flex items-center text-base font-bold text-gray-500 mb-6 hover:text-black transition-colors"><ArrowLeft size={20} className="mr-2"/> Back</button>
                    <h3 className="text-3xl font-black mb-6">Customer Info</h3>
                    <div className="space-y-4 flex-1 overflow-y-auto no-scrollbar">
                        <input placeholder="Name" className="w-full p-4 text-lg rounded-xl border border-gray-200 focus:outline-none focus:border-black transition-colors bg-white" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        {/* ... inputs ... */}
                    </div>
                    <button onClick={handleGeneratePDF} disabled={isGenerating} className={`w-full mt-4 text-white py-4 rounded-full text-lg font-bold transition-all ${isGenerating ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'}`}>Download PDF</button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center relative">
                     {/* Visual Area */}
                     {capturedImage ? <img src={capturedImage} className="w-[80%] object-contain" /> : <Box size={100} />}
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="w-1/2 bg-white flex flex-col relative p-10">
                <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-50 transition-colors"><X size={24} className="text-gray-500" /></button>
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-5xl font-bold tracking-tight text-black mb-2">My Custom Unit</h2>
                  <p className="text-3xl text-gray-500 font-medium mb-10">₩ {data.totalPrice.toLocaleString()}</p>
                  <div className="space-y-6 mb-12">
                    {/* Specs */}
                    <div className="flex justify-between py-4 border-b border-gray-100"><span className="text-base font-medium text-gray-500">Configuration</span><span className="text-base font-bold text-black">{data.units.length} Modules</span></div>
                    <div className="py-2"><button onClick={() => setMode('quote')} className="w-full border border-gray-200 text-gray-600 font-bold text-lg py-4 rounded-xl hover:bg-gray-50 hover:text-black transition-colors flex items-center justify-center gap-2"><FileText size={22} /> Get Quote</button></div>
                  </div>
                  <div className="flex gap-4 mt-auto">
                    <button onClick={handleSaveClick} className="flex-1 flex items-center justify-center gap-2 py-5 rounded-full text-lg font-bold transition-all border bg-white border-gray-200 hover:border-black hover:text-black"><Check size={22} /> Save Asset</button>
                    <button onClick={() => { onAddToCart(); onClose(); }} className="flex-[1.5] bg-black text-white py-5 rounded-full text-lg font-bold hover:bg-gray-800"><ShoppingBag size={22} /> Add to Cart</button>
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