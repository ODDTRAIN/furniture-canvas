import React, { useState, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Center } from "@react-three/drei";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// [Import Modules]
import { getUnitWidth, SIDE_THICK, UNIT_GAP, HEIGHT_OPTIONS, calculateUnitPrice, TOOLS, isHeightValid } from "../components/configurator/constants";
import { styles } from "../components/configurator/styles";
import { UnitAssembler } from "../components/configurator/ConfigLogic";

export default function Configurator() {
  const [units, setUnits] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showNames, setShowNames] = useState(true);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [isNightMode, setIsNightMode] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  
  // Modal & Export State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", status: "planned", remarks: "" });

  const controlsRef = useRef();
  const invoiceRef = useRef();
  const invoiceImageRef = useRef();

  // --- Helper Functions ---
  const getStartLayerIndex = (blocks, currentBlockIdx) => {
    let count = 0;
    for (let i = 0; i < currentBlockIdx; i++) count += blocks[i].rows.length;
    return count;
  };

  // --- Actions ---
  const addUnit = () => {
    const newId = `u-${Date.now()}`;
    setUnits([...units, { id: newId, columns: 1, blocks: [{ id: `b-${Date.now()}`, rows: [0.384] }], accessories: {} }]);
    setSelectedUnitId(newId);
  };
  const removeUnit = (id) => { setUnits(units.filter(u => u.id !== id)); if(selectedUnitId === id) setSelectedUnitId(null); };
  const updateUnit = (id, fn) => setUnits(units.map(u => u.id === id ? fn(u) : u));
  
  const updateColumns = (id, delta) => updateUnit(id, u => ({ ...u, columns: Math.max(1, Math.min(4, u.columns + delta)) }));
  const addBlockOnTop = (unitId, height) => updateUnit(unitId, u => ({ ...u, blocks: [...u.blocks, { id: `b-${Date.now()}`, rows: [height] }] }));
  const removeBlock = (unitId, blockIdx) => updateUnit(unitId, u => { const newBlocks = [...u.blocks]; newBlocks.splice(blockIdx, 1); return newBlocks.length === 0 ? u : { ...u, blocks: newBlocks }; });
  const addRowToBlock = (unitId, blockId, height) => updateUnit(unitId, u => ({ ...u, blocks: u.blocks.map(b => b.id === blockId && b.rows.length < 2 ? { ...b, rows: [...b.rows, height] } : b) }));
  const removeRowFromBlock = (unitId, blockId, rowIdx) => updateUnit(unitId, u => {
    const newBlocks = u.blocks.map(b => { if (b.id !== blockId) return b; const newRows = [...b.rows]; newRows.splice(rowIdx, 1); return { ...b, rows: newRows }; }).filter(b => b.rows.length > 0);
    return { ...u, blocks: newBlocks };
  });
  const updateRowHeight = (unitId, blockId, rowIdx, newHeight) => { updateUnit(unitId, u => ({ ...u, blocks: u.blocks.map(b => { if (b.id !== blockId) return b; const newRows = [...b.rows]; newRows[rowIdx] = newHeight; return { ...b, rows: newRows }; }) })); setEditingId(null); };
  
  const handleCellClick = (unitId, cellKey, rowHeight) => {
    if (!activeTool) return;
    if (!isHeightValid(activeTool, rowHeight)) { alert("Cannot place accessory here."); return; }
    
    updateUnit(unitId, u => {
      const newAcc = { ...u.accessories };
      if (activeTool === "eraser") delete newAcc[cellKey];
      else if (activeTool === "shelf") { 
        if (newAcc[cellKey]?.type === "shelf" && newAcc[cellKey].count < 4) newAcc[cellKey].count += 1; 
        else newAcc[cellKey] = { type: "shelf", count: 1 }; 
      }
      else newAcc[cellKey] = { type: activeTool, count: 1 };
      return { ...u, accessories: newAcc };
    });
  };

  // Stats
  const accessoryCounts = useMemo(() => {
    const stats = { "door-double": 0, "door-flip": 0, speaker: 0, shelf: 0 };
    units.forEach(u => { if (!u.accessories) return; Object.values(u.accessories).forEach(acc => { if (acc.type === "shelf") stats["shelf"] += acc.count; else if (stats[acc.type] !== undefined) stats[acc.type] += 1; }); });
    return stats;
  }, [units]);
  const hasAccessories = Object.values(accessoryCounts).some(c => c > 0);
  const { unitPositions, totalPrice } = useMemo(() => {
    let accX = 0, price = 0;
    const positions = units.map((u, index) => {
      const w = getUnitWidth(u.columns); const fullW = w + SIDE_THICK * 2; const x = accX + fullW / 2;
      price += calculateUnitPrice(u); accX += fullW + UNIT_GAP;
      return { id: u.id, x };
    });
    return { unitPositions: positions, totalPrice: price };
  }, [units]);

  const handleGeneratePDF = async () => {
    if (controlsRef.current) controlsRef.current.reset();
    setTimeout(async () => {
      try {
        const canvas = document.querySelector("canvas");
        if (canvas && invoiceImageRef.current) invoiceImageRef.current.src = canvas.toDataURL("image/png");
        setTimeout(async () => {
          const element = invoiceRef.current;
          if (element) {
            const canvasInv = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#fff", windowWidth: 794 });
            const doc = new jsPDF("p", "mm", "a4");
            const imgProps = doc.getImageProperties(canvasInv.toDataURL("image/png"));
            const pdfH = (imgProps.height * doc.internal.pageSize.getWidth()) / imgProps.width;
            doc.addImage(canvasInv.toDataURL("image/png"), "PNG", 0, 0, doc.internal.pageSize.getWidth(), pdfH);
            doc.save("quote.pdf");
            setIsModalOpen(false);
          }
        }, 100);
      } catch (err) { console.error(err); alert("PDF Generation Failed"); }
    }, 200);
  };
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div style={styles.container}>
      <style>{`
        :root { --font-main: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif; --color-accent: #0066cc; }
        body { margin: 0; overflow: hidden; }
        .toggle-checkbox { height: 0; width: 0; visibility: hidden; position: absolute; }
        .toggle-label { cursor: pointer; text-indent: -9999px; width: 44px; height: 24px; background: #d1d1d6; display: block; border-radius: 100px; position: relative; transition: 0.3s; }
        .toggle-label:after { content: ''; position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background: #fff; border-radius: 90px; transition: 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .toggle-checkbox:checked + .toggle-label { background: var(--color-accent); }
        .toggle-checkbox:checked + .toggle-label:after { left: calc(100% - 2px); transform: translateX(-100%); }
        .hover-btn:hover { opacity: 1; color: #d70015 !important; }
        .hover-step-btn:hover:not(:disabled) { background: #e5e5ea !important; }
        .hover-pill:hover { background: #e5e5ea !important; color: #000 !important; }
        .hover-icon-btn:hover { color: #111 !important; transform: scale(1.1); }
        .hover-main-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,102,204,0.3); }
        .hover-edit-btn:hover { border-color: var(--color-accent) !important; color: var(--color-accent) !important; background: rgba(0,102,204,0.05) !important; }
        .tool-btn { transition: all 0.2s ease; }
        .tool-btn:hover { transform: translateY(-2px); background: #f5f5f7; }
        .tool-btn.active { background: #1d1d1f; color: #fff; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .export-btn:hover { background: #e5f9e5 !important; border-color: #34c759 !important; color: #34c759 !important; }
        .close-icon-btn:hover { color: #1d1d1f; }
      `}</style>

      <div style={styles.canvasContainer} onClick={() => { if (!activeTool) setSelectedUnitId(null); }}>
        <Canvas shadows dpr={[1, 2]} gl={{ preserveDrawingBuffer: true }} camera={{ position: [4, 3, 6], fov: 35 }}>
          <color attach="background" args={[isNightMode ? "#2b2b2b" : "#f5f5f7"]} />
          <ambientLight intensity={isNightMode ? 0.5 : 2.5} />
          <hemisphereLight skyColor={"#ffffff"} groundColor={"#f5f5f7"} intensity={isNightMode ? 0.1 : 0.5} />
          <Environment preset="city" blur={1} background={false} environmentIntensity={isNightMode ? 0.4 : 1} />
          <ContactShadows resolution={1024} scale={100} blur={2} opacity={0.4} far={10} color="#000000" />
          {units.length > 0 && (
            <Center top position={[0, -0.6, 0]}>
              {units.map((unit, idx) => (
                <UnitAssembler 
                  key={unit.id} 
                  unit={unit} 
                  position={[unitPositions.find(p => p.id === unit.id)?.x || 0, 0, 0]} 
                  showDimensions={showDimensions} 
                  showNames={showNames} 
                  isSelected={selectedUnitId === unit.id} 
                  label={`Furniture ${idx + 1}`} 
                  activeTool={activeTool} 
                  onCellClick={handleCellClick} 
                  isNightMode={isNightMode} 
                />
              ))}
            </Center>
          )}
          <OrbitControls ref={controlsRef} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.05} dampingFactor={0.05} enablePan={true} panSpeed={1} enabled={!activeTool} />
        </Canvas>
      </div>

      {/* Summary Panel */}
      {hasAccessories && (
        <div style={styles.summaryPanel}>
          <div style={styles.summaryHeader} onClick={() => setIsSummaryOpen(!isSummaryOpen)}>
            <span style={styles.summaryTitle}>Accessory List</span>
            <span style={styles.summaryToggle}>{isSummaryOpen ? "▼" : "▲"}</span>
          </div>
          {isSummaryOpen && (
            <div style={styles.summaryContent}>
              {Object.entries(accessoryCounts).map(([key, count]) => {
                if (count === 0) return null;
                const label = TOOLS.find((t) => t.id === key)?.label || key;
                return <div key={key} style={styles.summaryRow}><span style={styles.summaryLabel}>{label}</span><span style={styles.summaryValue}>{count}</span></div>;
              })}
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div style={styles.toolbarContainer}>
        <div style={styles.toolbar}>
          <div style={styles.toolbarLabel}>액세서리 도구</div>
          <div style={styles.toolGroup}>
            {TOOLS.map((tool) => (
              <button key={tool.id} className={`tool-btn ${activeTool === tool.id ? "active" : ""}`} style={styles.toolBtn} onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}>
                {tool.label}
              </button>
            ))}
          </div>
          {activeTool && <button style={styles.doneBtn} onClick={() => setActiveTool(null)}>완료</button>}
        </div>
      </div>

      {/* System Panel */}
      <div style={styles.uiPanel}>
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <h1 style={styles.title}>System Configurator</h1>
            <div style={styles.price}>￦ {totalPrice.toLocaleString()}</div>
            <button className="export-btn" style={styles.exportBtn} onClick={() => setIsModalOpen(true)}>견적서 저장하기 (PDF)</button>
          </div>
          <div style={styles.toggleGroup}>
            <div style={styles.toggleContainer}><span style={styles.toggleLabelText}>조명</span><input type="checkbox" id="light-toggle" className="toggle-checkbox" checked={isNightMode} onChange={(e) => setIsNightMode(e.target.checked)} /><label htmlFor="light-toggle" className="toggle-label">Toggle</label></div>
            <div style={styles.toggleContainer}><span style={styles.toggleLabelText}>치수 보기</span><input type="checkbox" id="dim-toggle" className="toggle-checkbox" checked={showDimensions} onChange={(e) => setShowDimensions(e.target.checked)} /><label htmlFor="dim-toggle" className="toggle-label">Toggle</label></div>
            <div style={styles.toggleContainer}><span style={styles.toggleLabelText}>이름 표시</span><input type="checkbox" id="name-toggle" className="toggle-checkbox" checked={showNames} onChange={(e) => setShowNames(e.target.checked)} /><label htmlFor="name-toggle" className="toggle-label">Toggle</label></div>
          </div>
        </div>
        {units.length === 0 ? (
          <div style={styles.emptyState}><div style={styles.emptyIcon}>+</div><h2 style={styles.emptyTitle}>Design Your Space</h2><button style={styles.mainBtn} className="hover-main-btn" onClick={addUnit}>캔버스에 새 가구 추가하기</button></div>
        ) : (
          <div style={styles.scrollArea}>
            {units.map((unit, idx) => {
              const isEven = idx % 2 !== 0; const cardStyle = isEven ? styles.cardEven : styles.cardOdd; const isSelected = selectedUnitId === unit.id;
              return (
                <div key={unit.id} style={{ ...cardStyle, border: isSelected ? "2px solid #0066cc" : cardStyle.border }} onClick={() => setSelectedUnitId(unit.id)}>
                  <div style={styles.cardHeader}><div style={styles.unitBadge}>UNIT {idx + 1}</div><button style={styles.textBtn} className="hover-btn" onClick={(e) => { e.stopPropagation(); removeUnit(unit.id); }}>삭제</button></div>
                  <div style={styles.controlRow}><span style={styles.label}>가로 너비</span><div style={styles.stepper}><button style={styles.stepBtn} className="hover-step-btn" onClick={(e) => { e.stopPropagation(); updateColumns(unit.id, -1); }} disabled={unit.columns <= 1}>−</button><span style={styles.stepVal}>{unit.columns}칸</span><button style={styles.stepBtn} className="hover-step-btn" onClick={(e) => { e.stopPropagation(); updateColumns(unit.id, 1); }} disabled={unit.columns >= 4}>+</button></div></div>
                  <div style={styles.blocksList}>
                    {unit.blocks.slice().reverse().map((block, bIdx) => {
                      const realBlockIdx = unit.blocks.length - 1 - bIdx;
                      const blockName = realBlockIdx === 0 ? "바닥 유닛" : `추가 유닛 ${realBlockIdx}`;
                      const startLayerNum = getStartLayerIndex(unit.blocks, realBlockIdx);
                      return (
                        <div key={block.id} style={styles.blockItem}>
                          <div style={styles.blockHeader}><span>{blockName}</span><button style={styles.iconBtn} className="hover-icon-btn" onClick={(e) => { e.stopPropagation(); removeBlock(unit.id, realBlockIdx); }}>×</button></div>
                          {block.rows.slice().reverse().map((h, reverseIdx) => {
                            const realRowIdx = block.rows.length - 1 - reverseIdx;
                            const rowUniqueKey = `${unit.id}-${block.id}-${realRowIdx}`;
                            const isEditing = editingId === rowUniqueKey;
                            const displayLayerNum = startLayerNum + realRowIdx + 1;
                            return (
                              <div key={realRowIdx} style={styles.layerContainer}>
                                {isEditing ? (
                                  <div style={styles.editGrid}>{HEIGHT_OPTIONS.map((opt) => (<button key={opt.val} className="hover-edit-btn" style={{ ...styles.editBtn, background: h === opt.val ? "var(--color-accent)" : "#fff", color: h === opt.val ? "#fff" : "#111" }} onClick={(e) => { e.stopPropagation(); updateRowHeight(unit.id, block.id, realRowIdx, opt.val); }}>{opt.label}</button>))}</div>
                                ) : (
                                  <div style={styles.rowDisplay}><span style={styles.layerLabel}>{displayLayerNum}단 높이</span><div style={{ display: "flex", alignItems: "center", gap: "8px" }}><button style={styles.valuePill} className="hover-pill" onClick={(e) => { e.stopPropagation(); setEditingId(rowUniqueKey); }}>{Math.round(h * 1000)}mm <span style={styles.chevron}>▼</span></button><button style={styles.rowRemoveBtn} className="hover-icon-btn" onClick={(e) => { e.stopPropagation(); removeRowFromBlock(unit.id, block.id, realRowIdx); }}>×</button></div></div>
                                )}
                              </div>
                            );
                          })}
                          {block.rows.length < 2 && (<div style={styles.addRowSection}><div style={styles.layerAddLabel}>{blockName}에 {block.rows.length + 1}단 높이 추가하기</div><div style={styles.optGrid}>{HEIGHT_OPTIONS.map((opt) => (<button key={opt.val} style={styles.optBtn} className="hover-step-btn" onClick={(e) => { e.stopPropagation(); addRowToBlock(unit.id, block.id, opt.val); }}>+ {opt.label}</button>))}</div></div>)}
                        </div>
                      );
                    })}
                  </div>
                  <div style={styles.addSection}><span style={styles.label}>UNIT {idx + 1}에 상단 수납 추가</span><div style={styles.optGrid}>{HEIGHT_OPTIONS.map((opt) => (<button key={opt.val} style={styles.primaryBtn} className="hover-main-btn" onClick={(e) => { e.stopPropagation(); addBlockOnTop(unit.id, opt.val); }}>+ {opt.label}</button>))}</div></div>
                </div>
              );
            })}
            <div style={{ paddingBottom: "20px" }}><button style={styles.mainBtn} className="hover-main-btn" onClick={addUnit}>캔버스에 새 가구 추가하기</button></div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.close-icon-btn} onClick={handleCloseModal}>×</button>
            <h2 style={{ margin: "0 0 20px 0", fontSize: "18px", fontWeight: "700" }}>견적서 저장 (Save Quote)</h2>
            <input style={styles.modalInput} placeholder="이름 (Name)" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
            <input style={styles.modalInput} placeholder="연락처 (Phone)" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
            <textarea style={styles.modalTextarea} placeholder="비고 (Remarks)" value={customerInfo.remarks} onChange={(e) => setCustomerInfo({ ...customerInfo, remarks: e.target.value })} />
            <div style={styles.modalBtnGroup}>
              <button style={{...styles.statusBtn, ...(customerInfo.status === "confirmed" ? styles.statusBtnActive : {})}} onClick={() => setCustomerInfo({ ...customerInfo, status: "confirmed" })}>구매 확정</button>
              <button style={{...styles.statusBtn, ...(customerInfo.status === "planned" ? styles.statusBtnActive : {})}} onClick={() => setCustomerInfo({ ...customerInfo, status: "planned" })}>구매 예정</button>
            </div>
            <div style={styles.actionBtnGroup}>
              <button style={styles.cancelBtn} onClick={handleCloseModal}>취소</button>
              <button style={styles.saveBtn} onClick={handleGeneratePDF}>PDF로 저장하기</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden Invoice HTML */}
      <div ref={invoiceRef} style={{ position: "fixed", left: "-10000px", top: 0, width: "794px", minHeight: "1123px", background: "white", padding: "40px", fontFamily: "sans-serif", color: "#111", boxSizing: "border-box" }}>
        <h1 style={{ borderBottom: "2px solid #000", paddingBottom: "10px", marginBottom: "20px" }}>견적서 (Quote)</h1>
        {/* ... Invoice Content (Same as original) ... */}
        <div style={{ textAlign: "right", marginTop: "20px", borderTop: "2px solid #000", paddingTop: "15px" }}><h2 style={{ fontSize: "24px", fontWeight: "bold" }}>총 합계: {totalPrice.toLocaleString()} ￦</h2></div>
      </div>
    </div>
  );
}