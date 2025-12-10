import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Box, Columns, FileText, Check, Crosshair, ArrowLeft, Download } from 'lucide-react'
import { calculateUnitPrice, ACCESSORY_PRICES, HEIGHT_OPTIONS, PRICE_TABLE } from './configurator/constants'
import { useStore } from '../store/useStore'
import { jsPDF } from 'jspdf'

// [FIX] 치수 포맷팅 (Null Safety)
const formatHeight = (val) => {
  if (val === null || val === undefined) return "-";
  const match = HEIGHT_OPTIONS.find(h => Math.abs(h.val - val) < 0.001);
  return match ? match.label : `${Math.round(val * 1000)}mm`;
}

// [Helper] 악세서리 이름 변환
const formatAccName = (key) => {
  const map = { 'door-double': 'Double Door', 'door-flip': 'Flip Door', 'speaker': 'Hi-Fi Speaker', 'shelf': 'Extra Shelf' };
  return map[key] || key;
}

// [FIX] 스택 가격 계산 (Null Safety)
const getStackPrice = (height, columns) => {
  if (height === null || height === undefined) return 0;
  const hKey = height.toString();
  return PRICE_TABLE[hKey]?.[columns] || 0;
};

// 폰트 로드
const loadFont = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Font loading failed:", e);
    return null;
  }
};

export default function ConfiguratorSaveModal({ isOpen, onClose, image, onSaveToCart, onSaveAsset, units, totalPrice }) {
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [isPdfMode, setIsPdfMode] = useState(false);
  const [pdfInfo, setPdfInfo] = useState({ name: '', phone: '', address: '', note: '' });

  // [FIX] Store에서 인벤토리 추가 함수 가져오기
  const { addToInventory } = useStore();
  
  const receiptData = useMemo(() => {
    if (!units) return [];
    return units.map((unit, index) => {
      const stackDetails = unit.blocks.map((b, bIdx) => {
        const rowsInfo = b.rows.map(h => ({
          heightLabel: formatHeight(h),
          price: getStackPrice(h, unit.columns)
        }));
        
        return {
          id: b.id,
          name: bIdx === 0 ? "Base Module" : `Stack Module 0${bIdx}`,
          rows: rowsInfo
        };
      });

      const accSummary = {};
      if (unit.accessories) {
        Object.values(unit.accessories).forEach(acc => {
          accSummary[acc.type] = (accSummary[acc.type] || 0) + (acc.count || 1);
        });
      }

      return {
        id: unit.id,
        name: `UNIT 0${index + 1}`,
        columns: unit.columns,
        stackDetails,
        accessories: accSummary,
        price: calculateUnitPrice(unit)
      };
    });
  }, [units]);

  // [CORE FEATURE] Zone 2 -> Zone 3 에셋 저장
  const handleSaveAssetClick = () => {
    // 1. 부모 컴포넌트(Configurator)의 onSaveAsset 호출 (필요 시)
    if (onSaveAsset) onSaveAsset();

    // 2. [중요] Store의 인벤토리에 저장
    // Zone 2의 units 전체를 하나의 'Custom Unit' 아이템으로 저장
    const customAsset = {
      id: `custom-${Date.now()}`,
      type: 'custom', // 커스텀 유닛임을 명시
      name: `Custom Unit (${units.length} Mods)`,
      price: totalPrice,
      image: image, // 캡처된 이미지 (썸네일용)
      configData: units // 실제 배치 데이터 (나중에 불러올 때 중요)
    };
    addToInventory(customAsset);

    // 3. 피드백 애니메이션
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handlePdfButtonClick = () => setIsPdfMode(true);
  const handlePdfBack = () => setIsPdfMode(false);

  const handleFinalPdfDownload = async () => {
    const doc = new jsPDF();
    
    const fontBase64 = await loadFont('/fonts/Pretendard.ttf');
    if (fontBase64) {
      doc.addFileToVFS('Pretendard.ttf', fontBase64);
      doc.addFont('Pretendard.ttf', 'Pretendard', 'normal');
      doc.setFont('Pretendard'); 
    }

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxContentY = pageHeight - margin;

    let yPos = 140; 
    const checkPageBreak = (addAmount) => {
      if (yPos + addAmount > maxContentY) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };
    
    // Header
    doc.setFontSize(24); doc.text("ODT ATELIER", margin, 25);
    doc.setFontSize(10); doc.text("OFFICIAL QUOTATION", margin, 32);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, 38);

    if (image) {
      doc.addImage(image, 'PNG', pageWidth - 80, 15, 60, 60);
    }

    // Info
    doc.setDrawColor(0); doc.setLineWidth(0.5);
    doc.line(margin, 80, pageWidth - margin, 80);
    doc.setFontSize(12); doc.text("Customer Details", margin, 90);
    doc.setFontSize(10);
    doc.text(`Name: ${pdfInfo.name}`, margin, 100);
    doc.text(`Contact: ${pdfInfo.phone}`, margin, 106);
    doc.text(`Address: ${pdfInfo.address}`, margin, 112);
    if(pdfInfo.note) doc.text(`Note: ${pdfInfo.note}`, margin, 118);
    doc.line(margin, 125, pageWidth - margin, 125);

    // Loop
    receiptData.forEach((item) => {
      checkPageBreak(30);
      doc.setFontSize(14);
      doc.text(`${item.name} (Width: ${item.columns} Cols)`, margin, yPos);
      doc.text(`W ${item.price.toLocaleString()}`, pageWidth - 50, yPos); 
      yPos += 8;

      checkPageBreak(10);
      doc.setFontSize(10); doc.setTextColor(100);
      doc.text("Configuration:", 25, yPos);
      yPos += 6;
      
      doc.setTextColor(0);
      [...item.stackDetails].reverse().forEach(stack => {
        [...stack.rows].reverse().forEach(row => {
          checkPageBreak(7);
          const rowText = `- ${stack.name} [${row.heightLabel}]`;
          doc.text(rowText, 30, yPos);
          const priceText = `W ${row.price.toLocaleString()}`;
          doc.text(priceText, pageWidth - 70, yPos);
          yPos += 5;
        });
      });

      if (Object.keys(item.accessories).length > 0) {
        checkPageBreak(15);
        yPos += 2;
        doc.setTextColor(100);
        doc.text("Accessories:", 25, yPos);
        yPos += 6;

        doc.setTextColor(0);
        Object.entries(item.accessories).forEach(([key, count]) => {
          checkPageBreak(7);
          const accPrice = ACCESSORY_PRICES[key] || 0;
          const lineTotal = accPrice * count;
          doc.text(`- ${formatAccName(key)} (x${count})`, 30, yPos);
          doc.text(`W ${lineTotal.toLocaleString()}`, pageWidth - 70, yPos); 
          yPos += 5;
        });
      }
      yPos += 10;
    });

    checkPageBreak(30);
    doc.setDrawColor(0); doc.setLineWidth(1);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;
    doc.setFontSize(18);
    doc.text("TOTAL ESTIMATE", margin, yPos);
    doc.text(`W ${totalPrice.toLocaleString()}`, pageWidth - 80, yPos);

    doc.save(`ODT_Quote_${pdfInfo.name || 'Client'}.pdf`);
    setPdfInfo({ name: '', phone: '', address: '', note: '' });
    setIsPdfMode(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-lg" />
          
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-7xl h-[85vh] rounded-[32px] shadow-2xl pointer-events-auto flex overflow-hidden border border-white/20"
            >
              
              {/* [Left] Snapshot Area */}
              <div className="w-1/2 relative flex flex-col p-8 border-r border-gray-200 bg-white overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#9ca3af_1.5px,transparent_1.5px)] [background-size:24px_24px]" />
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-1/2 left-0 w-full h-px bg-black/30"></div>
                    <div className="absolute left-1/2 top-0 w-px h-full bg-black/30"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black/40"><Crosshair size={24} strokeWidth={1.5} /></div>
                </div>

                <div className="mb-4 relative z-10 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-black tracking-widest uppercase flex items-center gap-2">
                    <div className="w-2 h-2 bg-black rounded-full animate-pulse"/>
                    Spec View
                  </h3>
                  <span className="font-mono text-[10px] text-gray-500">ORTHOGRAPHIC 1:1</span>
                </div>
                
                <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden group aspect-square my-auto z-20 p-1">
                  {image ? (
                    <img src={image} alt="Configuration Blueprint" className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 drop-shadow-2xl" />
                  ) : (
                    <div className="flex flex-col items-center gap-4 text-gray-300"><Box size={48} /><span className="text-sm font-medium">No Signal</span></div>
                  )}
                </div>
                
                <div className="mt-6 relative z-10">
                   <h2 className="text-3xl font-black text-black tracking-tighter mb-1">ODT ATELIER</h2>
                   <p className="text-sm text-gray-500 font-medium font-mono">Technical Specification Document</p>
                </div>
              </div>

              {/* [Right] Interactive Area */}
              <div className="w-1/2 bg-white flex flex-col relative z-30">
                <AnimatePresence mode="wait">
                  {!isPdfMode ? (
                    <motion.div key="receipt" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="flex flex-col h-full">
                      <div className="px-10 py-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                        <div>
                          <h2 className="text-2xl font-bold tracking-tight text-black">Order Summary</h2>
                          <p className="text-sm text-gray-500 mt-1">Check your specification details.</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors"><X size={24} className="text-black" /></button>
                      </div>

                      <div className="flex-1 overflow-y-auto px-10 py-6 space-y-6">
                        {receiptData.map((item) => (
                          <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">{item.name.split(' ')[1]}</div>
                                <div>
                                  <h3 className="font-bold text-lg text-black leading-tight">{item.name}</h3>
                                  <div className="flex gap-3 text-xs font-medium text-gray-500 mt-0.5"><span className="flex items-center gap-1"><Columns size={12}/> Width: {item.columns}</span></div>
                                </div>
                              </div>
                              <span className="font-mono text-lg font-bold text-black">₩ {item.price.toLocaleString()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Structure</p>
                                <ul className="space-y-1 text-sm text-gray-700">
                                  {[...item.stackDetails].reverse().map((stack, i) => (
                                    <React.Fragment key={i}>
                                      {[...stack.rows].reverse().map((row, rIdx) => (
                                        <li key={rIdx} className="flex justify-between items-center bg-gray-50 px-2 py-1.5 rounded mb-1">
                                          <span className="font-medium text-xs text-gray-500">{stack.name}</span>
                                          <span className="font-mono font-bold text-black">{row.heightLabel}</span>
                                        </li>
                                      ))}
                                    </React.Fragment>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Accessories</p>
                                {Object.keys(item.accessories).length > 0 ? (
                                  <ul className="space-y-1 text-sm">
                                    {Object.entries(item.accessories).map(([key, count]) => (<li key={key} className="flex justify-between items-center px-2 py-1.5"><span className="text-gray-600">{formatAccName(key)}</span><span className="font-bold text-black bg-gray-100 px-2 py-0.5 rounded-full text-xs">x{count}</span></li>))}
                                  </ul>
                                ) : (<p className="text-gray-300 text-sm italic px-2 py-1.5">No accessories</p>)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="px-10 py-8 border-t border-gray-100 bg-gray-50">
                        <div className="flex justify-between items-end mb-6"><span className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Estimated</span><span className="text-5xl font-black text-black tracking-tighter font-mono">₩ {totalPrice.toLocaleString()}</span></div>
                        <div className="flex gap-4 h-14">
                          <button onClick={handlePdfButtonClick} className="px-8 rounded-xl border-2 border-gray-200 hover:border-black hover:text-black text-gray-500 font-bold text-base transition-all flex items-center justify-center gap-2 active:scale-95 bg-white">
                            <FileText size={20} /> 견적서 저장하기
                          </button>
                          <motion.button onClick={handleSaveAssetClick} animate={{ backgroundColor: saveFeedback ? '#000000' : '#ffffff', color: saveFeedback ? '#ffffff' : '#000000', borderColor: saveFeedback ? '#000000' : '#e5e7eb' }} className="px-8 rounded-xl border-2 font-bold text-base transition-all active:scale-95 flex items-center justify-center gap-2 hover:border-black">
                            {saveFeedback ? <Check size={20} /> : <Box size={20} />}{saveFeedback ? "Saved!" : "Save Asset"}
                          </motion.button>
                          <button onClick={onSaveToCart} className="flex-1 bg-black text-white rounded-xl font-bold text-xl hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-black/10 group"><span>Add to Cart</span><ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" /></button>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    // [VIEW 2] PDF Info Form (기존 유지)
                    <motion.div key="pdfForm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.2 }} className="flex flex-col h-full bg-white">
                      <div className="px-10 py-6 border-b border-gray-100 flex items-center gap-4 bg-white z-10">
                        <button onClick={handlePdfBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"><ArrowLeft size={24} /></button>
                        <div><h2 className="text-2xl font-bold tracking-tight text-black">Customer Details</h2><p className="text-sm text-gray-500 mt-1">Enter information for your quotation.</p></div>
                      </div>
                      <div className="flex-1 px-10 py-8 space-y-6 overflow-y-auto">
                        <div className="space-y-2"><label className="text-sm font-bold text-gray-700">Client Name</label><input type="text" placeholder="홍길동" value={pdfInfo.name} onChange={(e) => setPdfInfo({...pdfInfo, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors bg-gray-50 focus:bg-white" /></div>
                        <div className="space-y-2"><label className="text-sm font-bold text-gray-700">Contact Number</label><input type="text" placeholder="010-0000-0000" value={pdfInfo.phone} onChange={(e) => setPdfInfo({...pdfInfo, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors bg-gray-50 focus:bg-white" /></div>
                        <div className="space-y-2"><label className="text-sm font-bold text-gray-700">Shipping Address</label><input type="text" placeholder="서울시 강남구..." value={pdfInfo.address} onChange={(e) => setPdfInfo({...pdfInfo, address: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors bg-gray-50 focus:bg-white" /></div>
                        <div className="space-y-2"><label className="text-sm font-bold text-gray-700">Notes / Remarks</label><textarea rows="4" placeholder="요청사항을 입력해주세요..." value={pdfInfo.note} onChange={(e) => setPdfInfo({...pdfInfo, note: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors bg-gray-50 focus:bg-white resize-none" /></div>
                      </div>
                      <div className="px-10 py-8 border-t border-gray-100 bg-gray-50">
                        <button onClick={handleFinalPdfDownload} disabled={!pdfInfo.name} className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${!pdfInfo.name ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800 shadow-black/10'}`}>
                          <Download size={22} /> <span>PDF 저장하기</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}