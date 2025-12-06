import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import * as THREE from "three";
// [수정] Environment, AccumulativeShadows 등 필요한 모듈 import
import { View, OrbitControls, Environment, ContactShadows, Grid, PerspectiveCamera, Center, SoftShadows } from "@react-three/drei"; 
import { useThree, useFrame } from "@react-three/fiber"; 
import { ShoppingCart, Plus, Minus, Trash2, Box, Maximize, Layers, MousePointer2, ArrowUp, Edit2, FileText, Wrench } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

import { getUnitWidth, SIDE_THICK, UNIT_GAP, HEIGHT_OPTIONS, calculateUnitPrice, TOOLS, isHeightValid, WOOD_THICK } from "../components/configurator/constants";
import { styles } from "../components/configurator/styles";
import { UnitAssembler, GlobalSelectionMarker } from "../components/configurator/ConfigLogic";
import { useStore } from "../store/useStore";
import ConfiguratorSaveModal from "../components/ConfiguratorSaveModal";
import AccessoryGuideModal from "../components/AccessoryGuideModal"; 

// ... (useButtonMode, CinematicFocus 등 기존 로직 그대로 유지 - 생략) ...
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
      const totalH = unit.blocks.reduce((acc, b) => acc + b.rows.reduce((r, h) => r + h + WOOD_THICK, 0) + WOOD_THICK, 0);
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
  // ... (기존 state, ref, hooks 유지) ...
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
  const [isGuideHovered, setIsGuideHovered] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isDockHoveredState, setIsDockHoveredState] = useState(false); 
  const inspectorRef = useRef(null);
  const isFloatingBtn = useButtonMode(inspectorRef);
  const { saveConfiguratorState: storeSaveConfig, configuratorState, addToCart, toggleCart, addToInventory, isDockHovered } = useStore();
  const controlsRef = useRef();
  const focusState = useRef(true);
  const isExpanded = isDockHoveredState || activeTool !== null;
  const EXPANDED_WIDTH = 360; 
  const COLLAPSED_WIDTH = 64;

  // ... (Calculation, MarkerTarget, Effects, Actions 동일 - 생략 없이 유지) ...
  const { unitPositions, totalPrice, totalWidth } = useMemo(() => {
    let accX = 0, price = 0;
    const positions = units.map((u) => {
      const w = getUnitWidth(u.columns); const fullW = w + SIDE_THICK * 2; const x = accX + fullW / 2; price += calculateUnitPrice(u); accX += fullW + UNIT_GAP; return { id: u.id, x };
    });
    const totalW = accX > 0 ? accX - UNIT_GAP : 0; return { unitPositions: positions, totalPrice: price, totalWidth: totalW };
  }, [units]);

  const markerTarget = useMemo(() => {
    const unit = units.find(u => u.id === selectedUnitId); if (!unit) return null; const pos = unitPositions.find(p => p.id === unit.id); const x = pos ? pos.x : 0; const h = unit.blocks.reduce((acc, b) => acc + b.rows.reduce((r, h) => r + h + WOOD_THICK, 0) + WOOD_THICK, 0); return { x, y: h };
  }, [selectedUnitId, units, unitPositions]);

  useEffect(() => { if (configuratorState?.units && configuratorState.units.length > 0) { setUnits(configuratorState.units); setSelectedUnitId(configuratorState.units[configuratorState.units.length - 1].id); } setIsInitialized(true); }, []); 
  useEffect(() => { if (isInitialized) { saveConfiguratorState(units, totalPrice); } }, [units, totalPrice, isInitialized, saveConfiguratorState]);

  const addUnit = () => { const newId = `u-${Date.now()}`; const newUnit = { id: newId, columns: 1, blocks: [{ id: `b-${Date.now()}`, rows: [0.384] }], accessories: {} }; setUnits([...units, newUnit]); setSelectedUnitId(newId); };
  const removeUnit = (id) => { const newUnits = units.filter(u => u.id !== id); setUnits(newUnits); if(selectedUnitId === id) setSelectedUnitId(null); };
  const updateUnit = (id, fn) => setUnits(units.map(u => u.id === id ? fn(u) : u));
  const updateColumns = (id, delta) => updateUnit(id, u => ({ ...u, columns: Math.max(1, Math.min(4, u.columns + delta)) }));
  const addBlockOnTop = (unitId, height) => updateUnit(unitId, u => ({ ...u, blocks: [...u.blocks, { id: `b-${Date.now()}`, rows: [height] }] }));
  const removeBlock = (unitId, blockIdx) => updateUnit(unitId, u => { const newBlocks = [...u.blocks]; newBlocks.splice(blockIdx, 1); return newBlocks.length === 0 ? u : { ...u, blocks: newBlocks }; });
  const addRowToBlock = (unitId, blockId, height) => updateUnit(unitId, u => ({ ...u, blocks: u.blocks.map(b => b.id === blockId && b.rows.length < 2 ? { ...b, rows: [...b.rows, height] } : b) }));
  const updateRowHeight = (unitId, blockId, rowIdx, newHeight) => { updateUnit(unitId, u => ({ ...u, blocks: u.blocks.map(b => { if (b.id !== blockId) return b; const newRows = [...b.rows]; newRows[rowIdx] = newHeight; return { ...b, rows: newRows }; }) })); setEditingId(null); };
  const handleCellClick = (unitId, cellKey, rowHeight) => { if (!activeTool) return; if (!isHeightValid(activeTool, rowHeight)) { alert("Cannot place accessory here."); return; } updateUnit(unitId, u => { const newAcc = { ...u.accessories }; if (activeTool === "eraser") delete newAcc[cellKey]; else if (activeTool === "shelf") { if (newAcc[cellKey]?.type === "shelf" && newAcc[cellKey].count < 4) newAcc[cellKey].count += 1; else newAcc[cellKey] = { type: "shelf", count: 1 }; } else newAcc[cellKey] = { type: activeTool, count: 1 }; return { ...u, accessories: newAcc }; }); };
  const handleOpenSaveModal = () => { const canvas = document.querySelector('canvas'); if (canvas) { setCapturedImage(canvas.toDataURL('image/png')); setIsSaveModalOpen(true); } };
  const handleAddToCart = () => { if (units.length === 0) return; const customProduct = { id: `custom-${Date.now()}`, name: `Custom Unit (${units.length} Mods)`, price: totalPrice, description: "Custom Configuration from ODT Lab", image: capturedImage }; addToCart(customProduct); toggleCart(); };
  const handleSaveAsset = () => { if (units.length === 0) return; const customAsset = { id: `asset-${Date.now()}`, name: `My Custom Unit`, price: totalPrice, configData: units, modelUrl: '/models/chair.glb', thumbnail: capturedImage }; addToInventory(customAsset); };
  const selectedUnit = units.find(u => u.id === selectedUnitId); const selectedUnitIndex = units.findIndex(u => u.id === selectedUnitId); const accList = useMemo(() => { if (!selectedUnit || !selectedUnit.accessories) return []; const counts = {}; Object.values(selectedUnit.accessories).forEach(acc => { const name = acc.type.split('-')[0]; const displayName = name.charAt(0).toUpperCase() + name.slice(1); const fullDisplayName = acc.type === 'door-double' ? 'Double Door' : acc.type === 'door-flip' ? 'Flip Door' : displayName; counts[fullDisplayName] = (counts[fullDisplayName] || 0) + (acc.count || 1); }); return Object.entries(counts); }, [selectedUnit]);
  const handlePointerMissed = (e) => { if (e.target.closest('.prevent-miss')) return; if (!activeTool) setSelectedUnitId(null); };

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .rotating-border { animation: spin 4s linear infinite; }`}</style>

      <View style={styles.canvasContainer}>
          <color attach="background" args={[isNightMode ? "#1a1a1a" : "#f5f5f7"]} />
          
          {/* [조명 리셋] City 프리셋 + 깔끔한 화이트 조명 */}
          <group>
            <ambientLight intensity={0.5} color="#ffffff" />
            <directionalLight 
              position={[-5, 10, 5]} 
              intensity={1.5} 
              color="#ffffff" 
              castShadow 
              shadow-bias={-0.0001}
            />
            <directionalLight 
              position={[0, 2, 10]} 
              intensity={0.8} 
              color="#fff0dd" 
            />
            <spotLight 
              position={[10, 5, -5]} 
              angle={0.5} 
              penumbra={1} 
              intensity={1.2} 
              color="#dcebff" 
            />
          </group>

          {/* [Environment] 회전 적용 */}
          <Environment 
            preset="city" 
            blur={0.8} 
            environmentIntensity={0.9} 
            rotation={[0, Math.PI / 5, 0]} 
          />

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
              <UnitAssembler key={unit.id} unit={unit} position={[unitPositions.find(p => p.id === unit.id)?.x || 0, 0, 0]} showDimensions={showDimensions} showNames={true} isSelected={selectedUnitId === unit.id} label={`UNIT 0${idx + 1}`} activeTool={activeTool} onCellClick={handleCellClick} onUnitClick={() => setSelectedUnitId(unit.id)} isNightMode={isNightMode} />
            ))}
            <GlobalSelectionMarker visible={!!markerTarget} x={markerTarget ? markerTarget.x : 0} y={markerTarget ? markerTarget.y : 0} />
          </group>

          <OrbitControls ref={controlsRef} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.05} dampingFactor={0.05} enableDamping={true} enablePan={true} panSpeed={1} enabled={true} onStart={() => { focusState.current = false; }} />
      </View>

      {/* --- 상단 바 --- */}
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
              <div style={{ display:'flex', flexDirection:'column-reverse', gap:8, marginTop: 12 }}>
                {selectedUnit.blocks.map((block, bIdx) => {
                  const isBase = bIdx === 0; const blockName = isBase ? "BASE" : `STACK 0${bIdx}`;
                  return (
                    <div key={block.id} style={{ border: '1px solid #000', borderRadius: 8, padding: 8, background: '#fff' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4, alignItems:'center' }}><span style={{ fontSize:10, fontWeight:800, color:'#000' }}>{blockName}</span>{!isBase && (<button onClick={() => removeBlock(selectedUnit.id, bIdx)} style={styles.deleteBtn}><Minus size={12} /></button>)}</div>
                      <div style={{ display:'flex', flexDirection:'column-reverse', gap: 4 }}>
                        {block.rows.map((h, rIdx) => {
                          const rowKey = `${selectedUnit.id}-${block.id}-${rIdx}`; const isEditing = editingId === rowKey; const isHovered = hoveredStackId === rowKey; const visualHeight = Math.max(44, h * 120); 
                          return (
                            <div key={rIdx}>
                              {isEditing ? (
                                <div style={styles.editGrid}>{HEIGHT_OPTIONS.map((opt) => (<button key={opt.val} style={{ ...styles.editOptionBtn, ...(h === opt.val ? styles.editOptionBtnActive : {}) }} onClick={() => updateRowHeight(selectedUnit.id, block.id, rIdx, opt.val)}>{opt.label}</button>))}</div>
                              ) : (
                                <div onClick={() => setEditingId(rowKey)} onMouseEnter={() => setHoveredStackId(rowKey)} onMouseLeave={() => setHoveredStackId(null)} style={{ height: visualHeight, background: isHovered ? '#f0f0f2' : '#fff', border: isHovered ? '2px solid #000' : '1px solid #d1d1d6', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', cursor: 'pointer', transition: 'all 0.15s ease', position: 'relative' }}><span style={styles.stackLabel}>L{rIdx + 1}</span><div style={styles.stackValue}>{Math.round(h*1000)}mm<Edit2 size={12} color="#000" style={{ opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s', transform: isHovered ? 'scale(1)' : 'scale(0.8)' }} /></div></div>
                              )}
                            </div>
                          )
                        })}
                        {block.rows.length < 2 && (<button onClick={() => addRowToBlock(selectedUnit.id, block.id, 0.384)} style={{ height: 32, border:'1px dashed #ccc', background:'transparent', borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#999' }}><Plus size={14} /></button>)}
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => addBlockOnTop(selectedUnit.id, 0.384)} style={{ padding: 12, border: '1px solid #000', background: '#000', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}><ArrowUp size={14} /> STACK UNIT</button>
              </div>
            </div>
          {!isFloatingBtn && (
            <button style={styles.addUnitBlockBtn} onClick={addUnit}><Plus size={18} /> Create New Unit</button>
          )}
        </div>
      )}

      {/* --- LAYER 1: 3단 분리 독 (아뜰리에 버튼 위에 뜸) --- */}
      <LayoutGroup>
        <div 
          className="prevent-miss"
          style={{ 
            ...styles.bottomNavContainer, 
            bottom: isDockHovered ? '140px' : '100px', // ATELIER 버튼 위에 띄움
            zIndex: 50
          }}
        >
          {/* 1. Left: Guide Button (White Square) */}
          <motion.button 
            layout
            style={styles.sideButton}
            onClick={() => setIsAccModalOpen(true)}
            onMouseEnter={() => setIsGuideHovered(true)}
            onMouseLeave={() => setIsGuideHovered(false)}
          >
            <FileText size={24} strokeWidth={1.5} />
            <AnimatePresence>
              {isGuideHovered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -50 }} exit={{ opacity: 0, y: 10 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} className="absolute px-3 py-1.5 bg-[#1d1d1f] text-white text-[10px] font-bold rounded-lg whitespace-nowrap pointer-events-none shadow-xl">GUIDE<div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1d1d1f] rotate-45" /></motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* 2. Center: Dock (Tools - 스르륵 열리는 애니메이션) */}
          <motion.div 
            layout
            style={{ 
              ...styles.bottomDock, 
              width: 'auto', 
              backgroundColor: isExpanded ? 'rgba(255, 255, 255, 0.95)' : '#1d1d1f',
              padding: isExpanded ? '8px 16px' : '0px',
              gap: isExpanded ? '8px' : '0px',
            }}
            onMouseEnter={() => setIsDockHoveredState(true)}
            onMouseLeave={() => setIsDockHoveredState(false)}
          >
            <AnimatePresence mode="popLayout">
              {!isExpanded ? (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center w-full h-full"
                  style={{ width: 64, height: 64, display:'flex', alignItems:'center', justifyContent:'center' }}
                >
                  <Wrench size={24} color="#fff" />
                </motion.div>
              ) : (
                <motion.div
                  key="expanded"
                  style={styles.dockContent} 
                  initial={{ opacity: 0, x: -5 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -5 }}
                  transition={{ duration: 0.3 }} 
                >
                  <div 
                    style={{ ...styles.toolIconBtn, ...(activeTool === null ? styles.toolIconActive : {}) }} 
                    onClick={() => setActiveTool(null)} 
                    title="View Mode"
                  >
                    {activeTool && <div className="rotating-border" style={styles.viewHintRing} />}
                    <MousePointer2 size={20} />
                    <span style={styles.toolLabel}>View</span>
                  </div>
                  <div style={{ width:1, height:32, background:'rgba(0,0,0,0.1)' }} />
                  {TOOLS.map((tool) => {
                    const isActive = activeTool === tool.id;
                    const isDelete = tool.id === 'eraser';
                    return (
                      <div key={tool.id} style={{ ...styles.toolIconBtn, ...(isActive ? styles.toolIconActive : {}) }} onClick={() => setActiveTool(isActive ? null : tool.id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={styles.toolLabel}>{tool.label}</span>
                          {isDelete && (<div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30' }} />)}
                        </div>
                      </div>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* 3. Right: Cart Button (White Square) */}
          <motion.button 
            layout
            style={styles.cartButton}
            onClick={handleAddToCart}
            onMouseEnter={() => setIsCartHovered(true)}
            onMouseLeave={() => setIsCartHovered(false)}
          >
             <ShoppingCart size={24} strokeWidth={1.5} />
          </motion.button>
        </div>
      </LayoutGroup>

      {/* --- LAYER 2: ATELIER Button (최하단 고정 - 절대 건드리지 않음) --- */}
      <div className="prevent-miss" style={{ 
          position: 'absolute', 
          bottom: '32px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 40,
          pointerEvents: 'auto'
      }}>
        <button style={{
            height: '48px',
            padding: '0 32px',
            backgroundColor: '#ffffff',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: 'none',
            cursor: 'pointer'
        }}>
            <div style={{ width: 10, height: 10, backgroundColor: '#5e2b25', borderRadius: '50%' }} />
            <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '2px', color: '#1d1d1f' }}>ATELIER</span>
        </button>
      </div>

      {/* 모달 컴포넌트들 */}
      <ConfiguratorSaveModal 
        isOpen={isSaveModalOpen} 
        onClose={() => setIsSaveModalOpen(false)} 
        image={capturedImage} 
        onSaveToCart={handleAddToCart} 
        onSaveAsset={handleSaveAsset} 
      />
      
      <AccessoryGuideModal 
        isOpen={isAccModalOpen} 
        onClose={() => setIsAccModalOpen(false)} 
      />

    </div>
  );
}