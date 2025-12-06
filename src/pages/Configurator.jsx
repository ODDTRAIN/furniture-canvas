import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber"; 
import { OrbitControls, Environment, ContactShadows, Grid } from "@react-three/drei"; // Center 제거
import { ShoppingCart, Plus, Minus, Trash2, Box, Maximize, Layers, MousePointer2, ArrowUp, Edit2, Grid as GridIcon, CircleHelp } from 'lucide-react';

import { getUnitWidth, SIDE_THICK, UNIT_GAP, HEIGHT_OPTIONS, calculateUnitPrice, TOOLS, isHeightValid, WOOD_THICK } from "../components/configurator/constants";
import { styles } from "../components/configurator/styles";
import { UnitAssembler, GlobalSelectionMarker } from "../components/configurator/ConfigLogic";
import { useStore } from "../store/useStore";
import ConfiguratorSaveModal from "../components/ConfiguratorSaveModal";
import AccessoryGuideModal from "../components/AccessoryGuideModal"; 

// --- Helper: Button Mode ---
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

// --- Cinematic Focus ---
const CinematicFocus = ({ selectedUnitId, units, unitPositions, totalWidth, controlsRef }) => {
  const { camera } = useThree();
  const [goal, setGoal] = useState(null);
  const isUserInteracting = useRef(false);

  useEffect(() => {
    if (!selectedUnitId || !controlsRef.current) return;

    const unit = units.find(u => u.id === selectedUnitId);
    const pos = unitPositions.find(p => p.id === selectedUnitId);
    
    if (unit && pos) {
      // [중요] 수동 정렬된 그룹의 오프셋을 반영하여 타겟 계산
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
      isUserInteracting.current = false;
    }
  }, [selectedUnitId, units, unitPositions, totalWidth]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const onStart = () => { isUserInteracting.current = true; setGoal(null); };
    controls.addEventListener('start', onStart);
    return () => controls.removeEventListener('start', onStart);
  }, [controlsRef]);

  useFrame((state, delta) => {
    if (!isUserInteracting.current && goal && controlsRef.current) {
      const controls = controlsRef.current;
      const damp = delta * 3.0;
      controls.target.lerp(goal.target, damp);
      camera.position.lerp(goal.cameraPos, damp);
      if (controls.target.distanceTo(goal.target) < 0.01 && camera.position.distanceTo(goal.cameraPos) < 0.01) { setGoal(null); }
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

  const inspectorRef = useRef(null);
  const isFloatingBtn = useButtonMode(inspectorRef);

  const { saveConfiguratorState, configuratorState, addToCart, toggleCart, addToInventory, isDockHovered } = useStore();
  const controlsRef = useRef();

  // --- Calculation ---
  const { unitPositions, totalPrice, totalWidth } = useMemo(() => {
    let accX = 0, price = 0;
    const positions = units.map((u) => {
      const w = getUnitWidth(u.columns); 
      const fullW = w + SIDE_THICK * 2; 
      const x = accX + fullW / 2;
      price += calculateUnitPrice(u); 
      accX += fullW + UNIT_GAP;
      return { id: u.id, x };
    });
    // 전체 너비 = 마지막 위치 + 마지막 유닛 절반 - 첫 유닛 절반 (또는 누적 accX - GAP)
    // 간단하게: accX - UNIT_GAP
    const totalW = accX > 0 ? accX - UNIT_GAP : 0; 
    return { unitPositions: positions, totalPrice: price, totalWidth: totalW };
  }, [units]);

  // 마커 타겟 (그룹 내부 로컬 좌표계)
  const markerTarget = useMemo(() => {
    const unit = units.find(u => u.id === selectedUnitId);
    if (!unit) return null;
    const pos = unitPositions.find(p => p.id === unit.id);
    
    // 그룹 내에서는 pos.x가 곧 로컬 x좌표임
    const x = pos ? pos.x : 0; 
    
    const h = unit.blocks.reduce((acc, b) => acc + b.rows.reduce((r, h) => r + h + WOOD_THICK, 0) + WOOD_THICK, 0);
    return { x, y: h };
  }, [selectedUnitId, units, unitPositions]);

  // --- Handlers ---
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const onStart = () => { };
    controls.addEventListener('start', onStart);
    return () => controls.removeEventListener('start', onStart);
  }, [controlsRef, activeTool]);

  const handleOpenSaveModal = () => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const fovInRadians = (35 * Math.PI) / 180;
      const fitDistance = (totalWidth / 2) / Math.tan(fovInRadians / 2);
      const finalDistance = Math.max(5, fitDistance * 1.5);
      const viewDirection = new THREE.Vector3(1, 0.6, 1).normalize(); 
      const targetPosition = viewDirection.multiplyScalar(finalDistance); 
      // 캡처 시에는 정중앙(0,0,0)을 봅니다. (수동 정렬했으므로 0,0,0이 전체의 중심임)
      controls.object.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
      controls.target.set(0, 0, 0); 
      controls.update();
    }
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        setCapturedImage(canvas.toDataURL('image/png'));
        setIsSaveModalOpen(true);
      }
    }, 400); 
  };

  useEffect(() => {
    if (configuratorState?.units && configuratorState.units.length > 0) {
      setUnits(configuratorState.units);
      setSelectedUnitId(configuratorState.units[configuratorState.units.length - 1].id);
    }
    setIsInitialized(true);
  }, []); 

  useEffect(() => { if (isInitialized) { saveConfiguratorState(units, totalPrice); } }, [units, totalPrice, isInitialized, saveConfiguratorState]);

  // Actions
  const addUnit = () => { const newId = `u-${Date.now()}`; const newUnit = { id: newId, columns: 1, blocks: [{ id: `b-${Date.now()}`, rows: [0.384] }], accessories: {} }; setUnits([...units, newUnit]); setSelectedUnitId(newId); };
  const removeUnit = (id) => { const newUnits = units.filter(u => u.id !== id); setUnits(newUnits); if(selectedUnitId === id) setSelectedUnitId(null); };
  const updateUnit = (id, fn) => setUnits(units.map(u => u.id === id ? fn(u) : u));
  const updateColumns = (id, delta) => updateUnit(id, u => ({ ...u, columns: Math.max(1, Math.min(4, u.columns + delta)) }));
  const addBlockOnTop = (unitId, height) => updateUnit(unitId, u => ({ ...u, blocks: [...u.blocks, { id: `b-${Date.now()}`, rows: [height] }] }));
  const removeBlock = (unitId, blockIdx) => updateUnit(unitId, u => { const newBlocks = [...u.blocks]; newBlocks.splice(blockIdx, 1); return newBlocks.length === 0 ? u : { ...u, blocks: newBlocks }; });
  const addRowToBlock = (unitId, blockId, height) => updateUnit(unitId, u => ({ ...u, blocks: u.blocks.map(b => b.id === blockId && b.rows.length < 2 ? { ...b, rows: [...b.rows, height] } : b) }));
  const removeRowFromBlock = (unitId, blockId, rowIdx) => updateUnit(unitId, u => { const newBlocks = u.blocks.map(b => { if (b.id !== blockId) return b; const newRows = [...b.rows]; newRows.splice(rowIdx, 1); return { ...b, rows: newRows }; }).filter(b => b.rows.length > 0); return { ...u, blocks: newBlocks }; });
  const updateRowHeight = (unitId, blockId, rowIdx, newHeight) => { updateUnit(unitId, u => ({ ...u, blocks: u.blocks.map(b => { if (b.id !== blockId) return b; const newRows = [...b.rows]; newRows[rowIdx] = newHeight; return { ...b, rows: newRows }; }) })); setEditingId(null); };
  const handleCellClick = (unitId, cellKey, rowHeight) => { if (!activeTool) return; if (!isHeightValid(activeTool, rowHeight)) { alert("Cannot place accessory here."); return; } updateUnit(unitId, u => { const newAcc = { ...u.accessories }; if (activeTool === "eraser") delete newAcc[cellKey]; else if (activeTool === "shelf") { if (newAcc[cellKey]?.type === "shelf" && newAcc[cellKey].count < 4) newAcc[cellKey].count += 1; else newAcc[cellKey] = { type: "shelf", count: 1 }; } else newAcc[cellKey] = { type: activeTool, count: 1 }; return { ...u, accessories: newAcc }; }); };
  const handleAddToCart = () => { if (units.length === 0) return; const customProduct = { id: `custom-${Date.now()}`, name: `Custom Unit (${units.length} Mods)`, price: totalPrice, description: "Custom Configuration from ODT Lab", image: capturedImage }; addToCart(customProduct); toggleCart(); };
  const handleSaveAsset = () => { if (units.length === 0) return; const customAsset = { id: `asset-${Date.now()}`, name: `My Custom Unit`, price: totalPrice, configData: units, modelUrl: '/models/chair.glb', thumbnail: capturedImage }; addToInventory(customAsset); };

  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const selectedUnitIndex = units.findIndex(u => u.id === selectedUnitId);
  
  const accList = useMemo(() => {
    if (!selectedUnit || !selectedUnit.accessories) return [];
    const counts = {};
    Object.values(selectedUnit.accessories).forEach(acc => {
        const name = acc.type.split('-')[0]; 
        const displayName = name.charAt(0).toUpperCase() + name.slice(1);
        const fullDisplayName = acc.type === 'door-double' ? 'Double Door' : acc.type === 'door-flip' ? 'Flip Door' : displayName;
        counts[fullDisplayName] = (counts[fullDisplayName] || 0) + (acc.count || 1);
    });
    return Object.entries(counts); 
  }, [selectedUnit]);

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        @keyframes rotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .blinking-dot { animation: blink 2s infinite ease-in-out; }
        .rotating-border { animation: rotate 4s linear infinite; }
      `}</style>

      <div style={{ ...styles.glassPanel, ...styles.topBar }}>
        <div style={styles.brandingGroup}><span style={styles.brandTitle}>ODT LAB</span><span style={styles.brandSubtitle}>CONFIGURATOR v2.0</span></div>
        <div style={styles.actionGroup}><div style={{ fontSize:10, color:'#000', fontWeight:600, marginRight:8, fontFamily:'monospace' }}>AUTO-SAVED</div><div style={styles.priceTag}>₩ {totalPrice.toLocaleString()}</div></div>
      </div>

      <div style={styles.canvasContainer}>
        <Canvas shadows dpr={[1, 2]} gl={{ preserveDrawingBuffer: true }} camera={{ position: [4, 3, 6], fov: 35 }} onPointerMissed={() => { if (!activeTool) setSelectedUnitId(null); }}>
          <color attach="background" args={[isNightMode ? "#1a1a1a" : "#f0f0f2"]} />
          <group position={[0, -0.01, 0]}>
            <Grid infiniteGrid cellSize={0.5} sectionSize={2} fadeDistance={20} sectionColor={isNightMode ? "#444" : "#ccc"} cellColor={isNightMode ? "#333" : "#e5e5e5"} />
          </group>
          <ambientLight intensity={isNightMode ? 0.5 : 1.5} />
          <hemisphereLight skyColor={"#ffffff"} groundColor={isNightMode ? "#111" : "#f5f5f7"} intensity={isNightMode ? 0.2 : 0.5} />
          <Environment preset="city" blur={1} background={false} environmentIntensity={isNightMode ? 0.4 : 0.8} />
          <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.4} far={10} color="#000000" />
          
          {/* [중요] CinematicFocus에도 totalWidth 전달 */}
          <CinematicFocus 
            selectedUnitId={selectedUnitId} 
            units={units} 
            unitPositions={unitPositions} 
            totalWidth={totalWidth}
            controlsRef={controlsRef} 
          />

          {/* [수동 중앙 정렬 그룹] Y=0 고정 */}
          <group position={[-totalWidth / 2, 0, 0]}>
            {units.map((unit, idx) => (
              <UnitAssembler key={unit.id} unit={unit} position={[unitPositions.find(p => p.id === unit.id)?.x || 0, 0, 0]} showDimensions={showDimensions} showNames={true} isSelected={selectedUnitId === unit.id} label={`UNIT 0${idx + 1}`} activeTool={activeTool} onCellClick={handleCellClick} onUnitClick={() => setSelectedUnitId(unit.id)} isNightMode={isNightMode} />
            ))}
            <GlobalSelectionMarker visible={!!markerTarget} x={markerTarget ? markerTarget.x : 0} y={markerTarget ? markerTarget.y : 0} />
          </group>

          <OrbitControls ref={controlsRef} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.05} dampingFactor={0.05} enableDamping={true} enablePan={true} panSpeed={1} enabled={true} />
        </Canvas>
      </div>

      {units.length === 0 && (
        <div style={styles.emptyState}><div style={styles.emptyTitle}>START YOUR DESIGN</div><button style={styles.addUnitLargeBtn} onClick={addUnit}><Plus size={20} /> Create First Unit</button></div>
      )}

      {isFloatingBtn && (
        <button style={styles.addUnitFloatingLeftBtn} onClick={addUnit} title="Create New Unit"><Plus size={32} /></button>
      )}

      {selectedUnit && (
        <div style={styles.hudWrapper}>
          <div style={styles.hudRow}>
            {/* 가이드 버튼 제거됨 (모달로 이동) */}
            
            <div ref={inspectorRef} style={{ ...styles.glassPanel, ...styles.inspectorPanel }}>
              <div style={styles.panelHeader}>
                <div style={styles.activeIndicator}><div className="blinking-dot" style={styles.statusDot} /><span>UNIT 0{selectedUnitIndex + 1} ACTIVE</span></div>
                <button onClick={() => removeUnit(selectedUnit.id)} style={styles.deleteBtn}><Trash2 size={14} /></button>
              </div>

              <div style={styles.accSection}>
                <div style={styles.accListHeader}>ACCESSORY</div>
                {accList.length > 0 ? (
                  <div style={styles.accListContainer}>
                    {accList.map(([name, count], i) => (
                      <div key={i} style={styles.accListItem}><span>{name}</span><span style={styles.accListCount}>x{count}</span></div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 11, color: '#999', fontStyle: 'italic', padding: '4px 0' }}>No accessories added</div>
                )}
              </div>

              <div style={{ width: '100%', height: 1, background: '#e5e5ea', marginBottom: '12px' }} />

              <div style={styles.controlRow}><span style={styles.controlLabel}>WIDTH (COLUMNS)</span><div style={{ display:'flex', gap:8 }}><button style={styles.hudBtn} onClick={() => updateColumns(selectedUnit.id, -1)} disabled={selectedUnit.columns <= 1}><Minus size={12} /></button><span style={{ fontFamily:'monospace', fontSize:14, lineHeight:'26px', fontWeight:700 }}>{selectedUnit.columns}</span><button style={styles.hudBtn} onClick={() => updateColumns(selectedUnit.id, 1)} disabled={selectedUnit.columns >= 4}><Plus size={12} /></button></div></div>
              
              <div style={{ display:'flex', flexDirection:'column-reverse', gap:8, marginTop: 12 }}>
                {selectedUnit.blocks.map((block, bIdx) => {
                  const isBase = bIdx === 0;
                  const blockName = isBase ? "BASE" : `STACK 0${bIdx}`;
                  return (
                    <div key={block.id} style={{ border: '1px solid #000', borderRadius: 8, padding: 8, background: '#fff' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4, alignItems:'center' }}><span style={{ fontSize:10, fontWeight:800, color:'#000' }}>{blockName}</span>{!isBase && (<button onClick={() => removeBlock(selectedUnit.id, bIdx)} style={styles.deleteBtn}><Minus size={12} /></button>)}</div>
                      <div style={{ display:'flex', flexDirection:'column-reverse', gap: 4 }}>
                        {block.rows.map((h, rIdx) => {
                          const rowKey = `${selectedUnit.id}-${block.id}-${rIdx}`;
                          const isEditing = editingId === rowKey;
                          const isHovered = hoveredStackId === rowKey;
                          const visualHeight = Math.max(44, h * 120); 
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
          </div>

          {!isFloatingBtn && (
            <button style={styles.addUnitBlockBtn} onClick={addUnit}><Plus size={18} /> Create New Unit</button>
          )}
        </div>
      )}

      <div style={{ ...styles.glassPanel, ...styles.bottomDock, bottom: isDockHovered ? '140px' : '110px', transition: 'bottom 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)' }}>
        <div style={{ ...styles.toolIconBtn, ...(activeTool === null ? styles.toolIconActive : {}) }} onClick={() => setActiveTool(null)} title="View Mode">{activeTool && <div className="rotating-border" style={styles.viewHintRing} />}<MousePointer2 size={20} /><span style={styles.toolLabel}>View</span></div>
        <div style={{ width:1, height:32, background:'rgba(0,0,0,0.1)' }} />
        {TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          const isDelete = tool.id === 'eraser';
          return (
            <div key={tool.id} style={{ ...styles.toolIconBtn, width: 'auto', padding: '0 16px', ...(isActive ? styles.toolIconActive : {}) }} onClick={() => setActiveTool(isActive ? null : tool.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ ...styles.toolLabel, fontSize: '13px', marginTop: 0 }}>{tool.label}</span>{isDelete && (<div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b30' }} />)}</div>
            </div>
          )
        })}
        {units.length > 0 && (
          <>
            <div style={{ width:1, height:32, background:'rgba(0,0,0,0.1)' }} />
            <div style={{ ...styles.toolIconBtn, background:'#1d1d1f', color:'white', width:'auto', padding:'0 20px', flexDirection:'row', gap:8 }} onClick={handleOpenSaveModal} title="Add All to Cart"><ShoppingCart size={18} /><span style={{ fontSize: 12, fontWeight: 700 }}>ADD</span></div>
          </>
        )}
      </div>

      <div style={{ position:'absolute', bottom:40, left:40, display:'flex', flexDirection:'column', gap:8 }}>
        <button style={{ ...styles.glassPanel, padding:12, cursor:'pointer' }} onClick={() => setShowDimensions(!showDimensions)}><Maximize size={20} color={showDimensions ? "#0066cc" : "#1d1d1f"} /></button>
        <button style={{ ...styles.glassPanel, padding:12, cursor:'pointer' }} onClick={() => setIsNightMode(!isNightMode)}><Layers size={20} color={isNightMode ? "#0066cc" : "#1d1d1f"} /></button>
      </div>

      <ConfiguratorSaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} data={{ units, totalPrice }} onAddToCart={handleAddToCart} onSaveAsset={handleSaveAsset} capturedImage={capturedImage} onOpenGuide={() => setIsAccModalOpen(true)} />
      <AccessoryGuideModal isOpen={isAccModalOpen} onClose={() => setIsAccModalOpen(false)} />
    </div>
  );
}