import React, { useState, useMemo, useRef, useEffect, useLayoutEffect, Suspense } from "react";
import * as THREE from "three";
import { View, OrbitControls, Environment, ContactShadows, Grid, PerspectiveCamera, Html, useProgress } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber"; 
import { ShoppingCart, Plus, Minus, Trash2, Box, ArrowUp, Edit2, FileText, Wrench, MousePointer2 } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

import { getUnitWidth, SIDE_THICK, UNIT_GAP, HEIGHT_OPTIONS, calculateUnitPrice, TOOLS, isHeightValid, WOOD_THICK, PRICE_TABLE, ACCESSORY_PRICES } from "../components/configurator/constants";
import { styles } from "../components/configurator/styles";
import { UnitAssembler, GlobalSelectionMarker } from "../components/configurator/ConfigLogic";
import { useStore } from "../store/useStore";
import ConfiguratorSaveModal from "../components/ConfiguratorSaveModal";
import AccessoryGuideModal from "../components/AccessoryGuideModal"; 

// 로딩 컴포넌트
function Loader() {
  const { progress } = useProgress()
  return <Html center><div style={{ color: 'black', fontWeight: 800 }}>LOADING {progress.toFixed(0)}%</div></Html>
}

// [FIX 1] 스택 가격 계산 (안전장치 강화)
// 데이터가 null일 경우 계산을 건너뛰어 'toString' 오류를 방지합니다.
const getBlockPrice = (block, columns, accessories) => {
  let price = 0;
  
  if (!block || !block.rows) return 0; 

  block.rows.forEach(h => {
    // [중요] h가 null/undefined면 아직 높이가 선택되지 않은 상태이므로 계산 패스
    if (h === undefined || h === null) return; 
    
    const hKey = h.toString();
    if (PRICE_TABLE[hKey]) {
      price += PRICE_TABLE[hKey][columns] || 0;
    }
  });

  if (accessories) {
    Object.keys(accessories).forEach(key => {
      if (key.includes(block.id)) {
        const item = accessories[key];
        const itemPrice = ACCESSORY_PRICES[item.type] || 0;
        price += itemPrice * (item.count || 1);
      }
    });
  }
  return price;
};

const useButtonMode = (ref) => {
  const [isFloating, setIsFloating] = useState(false);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const checkHeight = () => {
      const panelHeight = ref.current.scrollHeight;
      const threshold = window.innerHeight * 0.65; 
      setIsFloating(panelHeight > threshold);
    };
    checkHeight();
    const observer = new ResizeObserver(checkHeight);
    observer.observe(ref.current);
    window.addEventListener('resize', checkHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkHeight);
    };
  }, [ref]);
  return isFloating;
};

const CinematicFocus = ({ selectedUnitId, units, unitPositions, totalWidth, controlsRef, focusState }) => {
  const { camera } = useThree(); 
  const [goal, setGoal] = useState(null);
  useEffect(() => {
    if (!selectedUnitId || !controlsRef.current) return;
    const unit = units.find(u => u.id === selectedUnitId);
    const pos = unitPositions.find(p => p.id === selectedUnitId);
    if (unit && pos) {
      focusState.current = true; 
      const groupOffsetX = -totalWidth / 2;
      const absoluteX = pos.x + groupOffsetX;
      const totalH = unit.blocks.reduce((acc, b) => acc + b.rows.reduce((r, h) => r + (h || 0) + WOOD_THICK, 0) + WOOD_THICK, 0);
      const HUD_OFFSET_X = 0.3; 
      const targetVec = new THREE.Vector3(absoluteX + HUD_OFFSET_X, totalH * 0.5, 0);
      const currentCamPos = camera.position.clone();
      const currentTarget = controlsRef.current.target.clone();
      const viewDir = new THREE.Vector3().subVectors(currentCamPos, currentTarget).normalize();
      const unitWidth = getUnitWidth(unit.columns);
      const dist = 4.5 + (unitWidth * 0.5) + (totalH * 0.3);
      const newCamPos = targetVec.clone().add(viewDir.multiplyScalar(dist));
      setGoal({ target: targetVec, cameraPos: newCamPos });
    }
  }, [selectedUnitId, units, unitPositions, totalWidth, camera, controlsRef, focusState]);
  useFrame((state, delta) => {
    if (focusState.current && goal && controlsRef.current) {
      const controls = controlsRef.current;
      const damp = delta * 4.0;
      controls.target.lerp(goal.target, damp);
      camera.position.lerp(goal.cameraPos, damp);
      if (controls.target.distanceTo(goal.target) < 0.01 && camera.position.distanceTo(goal.cameraPos) < 0.01) { 
        setGoal(null); 
      }
      controls.update();
    }
  });
  return null;
};

export default function Configurator() {
  const [units, setUnits] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showDimensions, setShowDimensions] = useState(true);
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [activeTool, setActiveTool] = useState(null);
  const [isNightMode, setIsNightMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [hoveredStackId, setHoveredStackId] = useState(null); 
  const [hoveredBlockId, setHoveredBlockId] = useState(null); 
  const [isGuideHovered, setIsGuideHovered] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isDockHoveredState, setIsDockHoveredState] = useState(false); 
  const inspectorRef = useRef(null);
  const isFloatingBtn = useButtonMode(inspectorRef);
  
  const { 
    saveConfiguratorState, 
    configuratorState, 
    addToCart, 
    toggleCart, 
    addToInventory, 
    isDockHovered 
  } = useStore();
  
  const controlsRef = useRef();
  const focusState = useRef(true);
  const isExpanded = isDockHoveredState || activeTool !== null;

  const getCompressedThumbnail = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;

    try {
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      const size = 512; 

      const sSize = Math.min(canvas.width, canvas.height);
      const sx = (canvas.width - sSize) / 2;
      const sy = (canvas.height - sSize) / 2;

      tempCanvas.width = size;
      tempCanvas.height = size;
      
      ctx.fillStyle = '#f5f5f7'; 
      ctx.fillRect(0, 0, size, size);

      ctx.drawImage(canvas, sx, sy, sSize, sSize, 0, 0, size, size);
      
      return tempCanvas.toDataURL('image/jpeg', 0.7);
    } catch (e) {
      console.error("Thumbnail generation failed:", e);
      return null;
    }
  };

  const { unitPositions, totalPrice, totalWidth } = useMemo(() => {
    let accX = 0, price = 0;
    const positions = units.map((u) => {
      const w = getUnitWidth(u.columns); const fullW = w + SIDE_THICK * 2; const x = accX + fullW / 2; price += calculateUnitPrice(u); accX += fullW + UNIT_GAP; return { id: u.id, x };
    });
    const totalW = accX > 0 ? accX - UNIT_GAP : 0; return { unitPositions: positions, totalPrice: price, totalWidth: totalW };
  }, [units]);

  const markerTarget = useMemo(() => {
    const unit = units.find(u => u.id === selectedUnitId); if (!unit) return null; const pos = unitPositions.find(p => p.id === unit.id); const x = pos ? pos.x : 0; const h = unit.blocks.reduce((acc, b) => acc + b.rows.reduce((r, h) => r + (h || 0) + WOOD_THICK, 0) + WOOD_THICK, 0); return { x, y: h };
  }, [selectedUnitId, units, unitPositions]);

  useEffect(() => { 
    if (configuratorState?.units && configuratorState.units.length > 0) { 
      setUnits(configuratorState.units); 
      setSelectedUnitId(configuratorState.units[configuratorState.units.length - 1].id); 
    } 
    setIsInitialized(true); 
  }, []); 

  useEffect(() => { 
    if (isInitialized && saveConfiguratorState) { 
      saveConfiguratorState(units, totalPrice); 
    } 
  }, [units, totalPrice, isInitialized, saveConfiguratorState]);

  const addUnit = () => { const newId = `u-${Date.now()}`; const newUnit = { id: newId, columns: 1, blocks: [{ id: `b-${Date.now()}`, rows: [0.384] }], accessories: {} }; setUnits([...units, newUnit]); setSelectedUnitId(newId); };
  const removeUnit = (id) => { const newUnits = units.filter(u => u.id !== id); setUnits(newUnits); if(selectedUnitId === id) setSelectedUnitId(null); };
  const updateUnit = (id, fn) => setUnits(units.map(u => u.id === id ? fn(u) : u));
  const updateColumns = (id, delta) => updateUnit(id, u => ({ ...u, columns: Math.max(1, Math.min(4, u.columns + delta)) }));
  const addBlockOnTop = (unitId, height) => updateUnit(unitId, u => ({ ...u, blocks: [...u.blocks, { id: `b-${Date.now()}`, rows: [height] }] }));
  const removeBlock = (unitId, blockIdx) => updateUnit(unitId, u => { const newBlocks = [...u.blocks]; newBlocks.splice(blockIdx, 1); return newBlocks.length === 0 ? u : { ...u, blocks: newBlocks }; });
  
  // [FIX 2] Add Row Logic (빈 층 추가 -> 편집 모드 자동 활성화)
  const addRowToBlock = (unitId, blockId) => {
    // 1. 현재 블록 찾기
    const unit = units.find(u => u.id === unitId);
    const block = unit.blocks.find(b => b.id === blockId);
    if (!block || block.rows.length >= 2) return;

    // 2. 새 층의 인덱스 계산
    const newRowIdx = block.rows.length; 
    
    // 3. 유닛 업데이트 (rows에 'null' 추가)
    updateUnit(unitId, u => ({ 
      ...u, 
      blocks: u.blocks.map(b => 
        b.id === blockId 
          ? { ...b, rows: [...b.rows, null] } // 높이 없는 빈 층 생성
          : b
      ) 
    }));

    // 4. [핵심] 방금 만든 빈 층을 '편집 상태(Editing)'로 설정 -> 선택 박스 자동 오픈
    const newRowKey = `${unitId}-${blockId}-${newRowIdx}`;
    setEditingId(newRowKey);
  };
  
  const removeRowFromBlock = (unitId, blockId, rowIdx) => {
    updateUnit(unitId, u => {
      const newAcc = { ...u.accessories };
      Object.keys(newAcc).forEach(key => {
        if (key.startsWith(`${blockId}-${rowIdx}-`)) {
          delete newAcc[key];
        }
      });
      return {
        ...u,
        accessories: newAcc,
        blocks: u.blocks.map(b => {
          if (b.id !== blockId) return b;
          const newRows = [...b.rows];
          newRows.splice(rowIdx, 1); 
          return { ...b, rows: newRows };
        })
      };
    });
  };

  const updateRowHeight = (unitId, blockId, rowIdx, newHeight) => { 
    updateUnit(unitId, u => ({ 
        ...u, 
        blocks: u.blocks.map(b => { 
            if (b.id !== blockId) return b; 
            const newRows = [...b.rows]; 
            newRows[rowIdx] = newHeight; // [완료] 선택한 높이로 값 업데이트
            return { ...b, rows: newRows }; 
        }) 
    })); 
    setEditingId(null); // 편집 모드 종료
  };

  const handleCellClick = (unitId, cellKey, rowHeight) => { if (!activeTool) return; if (!isHeightValid(activeTool, rowHeight)) { alert("Cannot place accessory here."); return; } updateUnit(unitId, u => { const newAcc = { ...u.accessories }; if (activeTool === "eraser") delete newAcc[cellKey]; else if (activeTool === "shelf") { if (newAcc[cellKey]?.type === "shelf" && newAcc[cellKey].count < 4) newAcc[cellKey].count += 1; else newAcc[cellKey] = { type: "shelf", count: 1 }; } else newAcc[cellKey] = { type: activeTool, count: 1 }; return { ...u, accessories: newAcc }; }); };
  const handlePointerMissed = (e) => { if (e.target.closest('.prevent-miss')) return; if (!activeTool) setSelectedUnitId(null); };

  const handleOpenSaveModal = () => { 
    const thumb = getCompressedThumbnail();
    if (thumb) {
      setCapturedImage(thumb); 
      setIsSaveModalOpen(true); 
    }
  };

  const handleAddToCart = () => { 
    if (units.length === 0) return; 
    const thumb = capturedImage || getCompressedThumbnail();
    const customProduct = { 
      id: `custom-${Date.now()}`,
      type: 'custom', 
      name: `Custom Unit (${units.length} Mods)`, 
      price: totalPrice, 
      description: "Custom Configuration from ODT Lab", 
      image: thumb,
      configData: units 
    }; 
    addToCart(customProduct); 
    if (isSaveModalOpen) setIsSaveModalOpen(false); 
    else toggleCart(); 
    setCapturedImage(null); 
  };

  const handleSaveAsset = () => { 
    if (units.length === 0) return; 
    const thumb = capturedImage || getCompressedThumbnail();
    const customAsset = { 
      id: `asset-${Date.now()}`, 
      type: 'custom', 
      name: `My Custom Unit`, 
      price: totalPrice, 
      configData: units, 
      modelUrl: null, 
      thumbnail: thumb 
    }; 
    addToInventory(customAsset); 
    setCapturedImage(null); 
  };

  const selectedUnit = units.find(u => u.id === selectedUnitId); const selectedUnitIndex = units.findIndex(u => u.id === selectedUnitId); const accList = useMemo(() => { if (!selectedUnit || !selectedUnit.accessories) return []; const counts = {}; Object.values(selectedUnit.accessories).forEach(acc => { const name = acc.type.split('-')[0]; const displayName = name.charAt(0).toUpperCase() + name.slice(1); const fullDisplayName = acc.type === 'door-double' ? 'Double Door' : acc.type === 'door-flip' ? 'Flip Door' : displayName; counts[fullDisplayName] = (counts[fullDisplayName] || 0) + (acc.count || 1); }); return Object.entries(counts); }, [selectedUnit]);

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .rotating-border { animation: spin 4s linear infinite; }`}</style>

      <View style={styles.canvasContainer}>
          <color attach="background" args={[isNightMode ? "#1a1a1a" : "#f5f5f7"]} />
          
          <Suspense fallback={<Loader />}>
            <group>
              <ambientLight intensity={0.5} color="#ffffff" />
              <directionalLight position={[-5, 10, 5]} intensity={1.5} color="#ffffff" castShadow shadow-bias={-0.0001} />
              <directionalLight position={[0, 2, 10]} intensity={0.8} color="#fff0dd" />
              <spotLight position={[10, 5, -5]} angle={0.5} penumbra={1} intensity={1.2} color="#dcebff" />
            </group>

            <Environment preset="city" blur={0.8} environmentIntensity={0.9} rotation={[0, Math.PI / 5, 0]} />

            <group position={[0, -0.01, 0]}>
              <Grid infiniteGrid cellSize={0.5} sectionSize={2} fadeDistance={20} sectionColor={isNightMode ? "#444" : "#ccc"} cellColor={isNightMode ? "#333" : "#e5e5e5"} />
            </group>
            
            <ContactShadows resolution={1024} scale={50} blur={2.5} opacity={0.3} far={10} color="#000000" />
            
            <PerspectiveCamera makeDefault position={[4, 3, 6]} fov={35} />

            <CinematicFocus 
              selectedUnitId={selectedUnitId} 
              units={units} 
              unitPositions={unitPositions} 
              totalWidth={totalWidth}
              controlsRef={controlsRef}
              focusState={focusState}
            />

            <group position={[-totalWidth / 2, 0, 0]} onPointerMissed={handlePointerMissed}>
              {units.map((unit, idx) => (
                <UnitAssembler 
                  key={unit.id} 
                  unit={unit} 
                  position={[unitPositions.find(p => p.id === unit.id)?.x || 0, 0, 0]} 
                  showDimensions={showDimensions} 
                  showNames={true} 
                  isSelected={selectedUnitId === unit.id} 
                  label={`UNIT 0${idx + 1}`} 
                  activeTool={activeTool} 
                  onCellClick={handleCellClick} 
                  onUnitClick={() => setSelectedUnitId(unit.id)} 
                  isNightMode={isNightMode}
                  hoveredBlockId={hoveredBlockId}
                  hoveredRowId={hoveredStackId} 
                />
              ))}
              <GlobalSelectionMarker visible={!!markerTarget} x={markerTarget ? markerTarget.x : 0} y={markerTarget ? markerTarget.y : 0} />
            </group>
          </Suspense>

          <OrbitControls ref={controlsRef} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.05} dampingFactor={0.05} enableDamping={true} enablePan={true} panSpeed={1} enabled={true} onStart={() => { focusState.current = false; }} />
      </View>

      <div className="prevent-miss" style={{ ...styles.glassPanel, ...styles.topBar }}>
        <div style={styles.brandingGroup}><span style={styles.brandTitle}>ODT LAB</span><span style={styles.brandSubtitle}>CONFIGURATOR v2.0</span></div>
        <div style={styles.actionGroup}><div style={{ fontSize:10, color:'#000', fontWeight:600, marginRight:8, fontFamily:'monospace' }}>AUTO-SAVED</div><div style={styles.priceTag}>₩ {totalPrice.toLocaleString()}</div></div>
      </div>

      {units.length === 0 && (
        <div className="prevent-miss" style={styles.emptyState}><div style={styles.emptyTitle}>START YOUR DESIGN</div><button style={styles.addUnitLargeBtn} onClick={addUnit}><Plus size={20} /> Create First Unit</button></div>
      )}

      {isFloatingBtn && (
        <button className="prevent-miss" style={styles.addUnitFloatingLeftBtn} onClick={addUnit} title="Create New Unit"><Plus size={32} /></button>
      )}

      {selectedUnit && (
        <div style={styles.hudWrapper} className="prevent-miss">
            <div ref={inspectorRef} style={{ ...styles.glassPanel, ...styles.inspectorPanel }} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              
              <div style={styles.panelHeader}>
                <div style={styles.activeIndicator}><div className="blinking-dot" style={styles.statusDot} /><span>UNIT 0{selectedUnitIndex + 1} ACTIVE</span></div>
                <button onClick={() => removeUnit(selectedUnit.id)} style={styles.deleteBtn}><Trash2 size={14} /></button>
              </div>
              
              <div style={styles.accSection}>
                <div style={styles.accListHeader}>ACCESSORY</div>
                {accList.length > 0 ? (
                  <div style={styles.accListContainer}>{accList.map(([name, count], i) => (<div key={i} style={styles.accListItem}><span>{name}</span><span style={styles.accListCount}>x{count}</span></div>))}</div>
                ) : (<div style={{ fontSize: 11, color: '#999', fontStyle: 'italic', padding: '4px 0' }}>No accessories added</div>)}
              </div>
              
              <div style={{ width: '100%', height: 1, background: '#e5e5ea', marginBottom: '12px' }} />
              
              <div style={styles.controlRow}><span style={styles.controlLabel}>WIDTH (COLUMNS)</span><div style={{ display:'flex', gap:8 }}><button style={styles.hudBtn} onClick={() => updateColumns(selectedUnit.id, -1)} disabled={selectedUnit.columns <= 1}><Minus size={12} /></button><span style={{ fontFamily:'monospace', fontSize:14, lineHeight:'26px', fontWeight:700 }}>{selectedUnit.columns}</span><button style={styles.hudBtn} onClick={() => updateColumns(selectedUnit.id, 1)} disabled={selectedUnit.columns >= 4}><Plus size={12} /></button></div></div>
              
              <div style={{ display:'flex', flexDirection:'column-reverse', gap:0, marginTop: 12 }}>
                {selectedUnit.blocks.map((block, bIdx) => {
                  const isBase = bIdx === 0; 
                  const blockName = isBase ? "BASE MODULE" : `STACK MODULE 0${bIdx}`;
                  const blockPrice = getBlockPrice(block, selectedUnit.columns, selectedUnit.accessories);
                  
                  return (
                    <div 
                      key={block.id} 
                      style={styles.stackCard}
                      onMouseEnter={() => setHoveredBlockId(block.id)}
                      onMouseLeave={() => setHoveredBlockId(null)}
                    >
                      <div style={styles.stackHeader}>
                        <span style={styles.stackTitle}>{blockName}</span>
                        <span style={styles.stackPrice}>₩ {blockPrice.toLocaleString()}</span>
                        
                        {!isBase ? (
                          <button onClick={() => removeBlock(selectedUnit.id, bIdx)} style={styles.deleteBtn}><Minus size={12} /></button>
                        ) : (
                          <div style={{ ...styles.deleteBtn, opacity: 0, cursor: 'default', pointerEvents: 'none' }} />
                        )}
                      </div>

                      <div style={{ display:'flex', flexDirection:'column-reverse', gap: 8 }}>
                        {block.rows.map((h, rIdx) => {
                          const rowKey = `${selectedUnit.id}-${block.id}-${rIdx}`; 
                          const isEditing = editingId === rowKey; 
                          const isHovered = hoveredStackId === rowKey; 
                          
                          // [FIX] h가 null일 경우 안전하게 처리
                          const displayHeight = h ? Math.round(h*1000) : 0;

                          return (
                            <div key={rIdx} style={styles.rowWrapper}>
                              {isEditing ? (
                                <div style={styles.editGrid}>{HEIGHT_OPTIONS.map((opt) => (<button key={opt.val} style={{ ...styles.editOptionBtn, ...(h === opt.val ? styles.editOptionBtnActive : {}) }} onClick={() => updateRowHeight(selectedUnit.id, block.id, rIdx, opt.val)}>{opt.label}</button>))}</div>
                              ) : (
                                <div 
                                  onClick={() => setEditingId(rowKey)} 
                                  onMouseEnter={(e) => { e.stopPropagation(); setHoveredStackId(rowKey); }} 
                                  onMouseLeave={(e) => { e.stopPropagation(); setHoveredStackId(null); }} 
                                  style={{ 
                                    ...styles.rowControl, 
                                    ...(isHovered ? styles.rowControlHover : {}) 
                                  }}
                                >
                                  <span style={styles.stackLabel}>L{rIdx + 1}</span>
                                  <div style={styles.stackValue}>
                                    {displayHeight}mm
                                    <Edit2 size={12} color="#000" style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s' }} />
                                    
                                    {rIdx > 0 ? (
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); removeRowFromBlock(selectedUnit.id, block.id, rIdx); }}
                                        style={styles.rowDeleteBtn}
                                        title="Remove Layer"
                                      >
                                        <Minus size={10} strokeWidth={3} />
                                      </button>
                                    ) : (
                                      <div style={{ ...styles.rowDeleteBtn, opacity: 0, cursor: 'default', pointerEvents: 'none', border: 'none', boxShadow: 'none' }} />
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                        
                        {block.rows.length < 2 && (
                          <button onClick={() => addRowToBlock(selectedUnit.id, block.id)} style={styles.addRowBtn}>
                            <Plus size={12} /> Add Shelf Layer
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => addBlockOnTop(selectedUnit.id, 0.384)} style={styles.addStackBtn}>
                  <Box size={16} /> ADD NEW STACK MODULE
                </button>
              </div>
            </div>
          {!isFloatingBtn && (
            <button style={styles.addUnitBlockBtn} onClick={addUnit}><Plus size={18} /> Create New Unit</button>
          )}
        </div>
      )}

      {/* Dock & Bottom UI */}
      <LayoutGroup>
        <div 
          className="prevent-miss"
          style={{ 
            ...styles.bottomNavContainer, 
            bottom: isDockHovered ? '140px' : '100px', 
            zIndex: 50
          }}
        >
          <motion.button layout style={styles.sideButton} onClick={() => setIsAccModalOpen(true)} onMouseEnter={() => setIsGuideHovered(true)} onMouseLeave={() => setIsGuideHovered(false)}> <FileText size={24} strokeWidth={1.5} /> </motion.button>
          <motion.div layout style={{ ...styles.bottomDock, width: 'auto', backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.95)' : '#1d1d1f', padding: isExpanded ? '8px 16px' : '0px', gap: isExpanded ? '8px' : '0px' }} onMouseEnter={() => setIsDockHoveredState(true)} onMouseLeave={() => setIsDockHoveredState(false)}>
            <AnimatePresence mode="popLayout">
              {!isExpanded ? ( <motion.div key="collapsed" className="flex items-center justify-center w-full h-full" style={{ width: 64, height: 64, display:'flex', alignItems:'center', justifyContent:'center' }}> <Wrench size={24} color="#fff" /> </motion.div> ) : (
                <motion.div key="expanded" style={styles.dockContent} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} transition={{ duration: 0.3 }}>
                  <div style={{ ...styles.toolIconBtn, ...(activeTool === null ? styles.toolIconActive : {}) }} onClick={() => setActiveTool(null)} title="View Mode"> {activeTool && <div className="rotating-border" style={styles.viewHintRing} />} <MousePointer2 size={20} /> <span style={styles.toolLabel}>View</span> </div>
                  <div style={{ width:1, height:32, background:'rgba(0,0,0,0.1)' }} />
                  {TOOLS.map((tool) => { const isActive = activeTool === tool.id; const isDelete = tool.id === 'eraser'; return ( <div key={tool.id} style={{ ...styles.toolIconBtn, ...(isActive ? styles.toolIconActive : {}) }} onClick={() => setActiveTool(isActive ? null : tool.id)}> <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}> <span style={styles.toolLabel}>{tool.label}</span> {isDelete && (<div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30' }} />)} </div> </div> ) })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <motion.button layout style={styles.cartButton} onClick={handleAddToCart} onMouseEnter={() => setIsCartHovered(true)} onMouseLeave={() => setIsCartHovered(false)}> <ShoppingCart size={24} strokeWidth={1.5} /> </motion.button>
        </div>
      </LayoutGroup>

      <ConfiguratorSaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} image={capturedImage} onSaveToCart={handleAddToCart} onSaveAsset={handleSaveAsset} />
      <AccessoryGuideModal isOpen={isAccModalOpen} onClose={() => setIsAccModalOpen(false)} />
    </div>
  );
}