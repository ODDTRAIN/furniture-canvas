import React, { useRef, useLayoutEffect, useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useLocation } from 'react-router-dom'; 
import { ShoppingCart, Plus, Minus, Trash2, Box, Edit2, FileText, Wrench, MousePointer2, Lightbulb, Library, ChevronRight } from 'lucide-react';
import { styles } from './styles'; 
import { HEIGHT_OPTIONS, TOOLS, getBlockPrice } from './constants';
import { useStore } from '../../store/useStore';
import CollectionModal from './CollectionModal';

// [Hook] 반응형 버튼 모드
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

// [Component] Hover Tooltip
const Tooltip = ({ text, isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: -45, scale: 1 }} 
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)', x: '-50%',
          background: 'rgba(0, 0, 0, 0.85)', color: 'white', padding: '6px 10px',
          borderRadius: '8px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap',
          pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', backdropFilter: 'blur(4px)'
        }}
      >
        {text}
        <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: '8px', height: '8px', background: 'rgba(0, 0, 0, 0.85)' }} />
      </motion.div>
    )}
  </AnimatePresence>
);

export default function ConfiguratorUI({ 
  units, totalPrice, selectedUnitId, activeTool, setActiveTool, editingId, setEditingId, 
  hoveredStackId, setHoveredStackId, setHoveredBlockId, onGuideOpen, actions, 
  lightMode, setLightMode
}) {
  const { isDockHovered } = useStore();
  const location = useLocation(); 
  
  const [isDockHoveredState, setIsDockHoveredState] = useState(false);
  const [isGuideHovered, setIsGuideHovered] = useState(false);
  const [isCartHovered, setIsCartHovered] = useState(false);
  const [isLightHovered, setIsLightHovered] = useState(false);
  
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [collectionTab, setCollectionTab] = useState('PRESETS');

  const inspectorRef = useRef(null);
  const isFloatingBtn = useButtonMode(inspectorRef);
  
  const isExpanded = isDockHoveredState || activeTool !== null;
  const selectedUnit = units.find(u => u.id === selectedUnitId);
  const selectedUnitIndex = units.findIndex(u => u.id === selectedUnitId);

  // [삭제됨] 유닛 자동 생성 코드 제거 (Configurator.jsx에서만 생성하도록)
  // useEffect(() => { if (units.length === 0) actions.addUnit(); }, ...);

  // ===========================================================================
  // [Entrance Animation Sequence]
  // ===========================================================================
  useEffect(() => {
    // Zone 1에서 넘어온 신호 확인 (introSequence 또는 openCollection)
    const shouldRunAnimation = location.state?.introSequence || location.state?.openCollection;

    if (shouldRunAnimation) {
      const runSequence = async () => {
        // 1. 대기
        await new Promise(r => setTimeout(r, 100));

        // 2. Dock 열기
        setIsDockHoveredState(true);
        await new Promise(r => setTimeout(r, 600));

        // 3. 툴팁 3개 동시 노출
        setIsLightHovered(true);
        setIsGuideHovered(true);
        setIsCartHovered(true);

        // 4. 1.2초간 보여주기
        await new Promise(r => setTimeout(r, 1200));

        // 5. 정리
        setIsLightHovered(false);
        setIsGuideHovered(false);
        setIsCartHovered(false);
        
        await new Promise(r => setTimeout(r, 200)); 
        setIsDockHoveredState(false); // 독 닫기

        // 6. 독 닫힌 후 컬렉션 모달(가이드 탭) 열기
        await new Promise(r => setTimeout(r, 300));
        setCollectionTab('GUIDE');
        setIsCollectionOpen(true);

        // [Clear] 신호 초기화 (새로고침 시 반복 방지)
        setTimeout(() => {
           window.history.replaceState({}, document.title);
        }, 500);
      };

      runSequence();
    }
  }, [location]);

  const handleLoadTemplate = (template) => {
    console.log("Loading Template:", template.name);
    if (template.config) {
      actions.addUnit(template.config);
    } else {
      actions.addUnit();
    }
  };

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

  // Lighting Controls
  const handleLightToggle = () => {
    setLightMode((prev) => (prev + 1) % 3);
  };

  const getLightIconColor = () => {
    if (lightMode === 1) return "#ffffff"; 
    if (lightMode === 2) return "#FFD700"; 
    return "#333333"; 
  };
  
  const getLightIconFill = () => {
    if (lightMode === 1) return "#ffffff";
    if (lightMode === 2) return "#FFD700";
    return "none";
  };

  const getLightTooltip = () => {
    if (lightMode === 0) return "Night Mode"; 
    if (lightMode === 1) return "Day & Light"; 
    return "Light Off"; 
  };

  return (
    <>
      <CollectionModal 
        isOpen={isCollectionOpen} 
        onClose={() => setIsCollectionOpen(false)}
        onLoadTemplate={handleLoadTemplate}
        initialTab={collectionTab} 
      />

      <div className="prevent-miss" style={{ ...styles.glassPanel, ...styles.topBar }}>
        <div style={styles.brandingGroup}><span style={styles.brandTitle}>ODT LAB</span><span style={styles.brandSubtitle}>CONFIGURATOR v2.0</span></div>
        <div style={styles.actionGroup}><div style={{ fontSize:10, color:'#000', fontWeight:600, marginRight:8, fontFamily:'monospace' }}>AUTO-SAVED</div><div style={styles.priceTag}>₩ {totalPrice.toLocaleString()}</div></div>
      </div>

      <motion.button
        className="prevent-miss"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'absolute', top: '120px', left: '40px', width: '90px', height: '90px',
          backgroundColor: '#1d1d1f', borderRadius: '24px',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: '8px', zIndex: 60, cursor: 'pointer'
        }}
        onClick={() => {
          setCollectionTab('PRESETS'); 
          setIsCollectionOpen(true);
        }}
      >
        <Library size={28} color="#ffffff" strokeWidth={1.5} />
        <span style={{ fontSize: '10px', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collection</span>
      </motion.button>

      <button 
        className="prevent-miss"
        style={{
          ...styles.lightToggleBtn,
          top: '141px', left: '150px', right: 'auto',
          backgroundColor: '#1d1d1f', border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)', position: 'absolute'
        }}
        onClick={handleLightToggle}
        onMouseEnter={() => setIsLightHovered(true)}
        onMouseLeave={() => setIsLightHovered(false)}
      >
        <Tooltip text={isLightHovered ? (isDockHoveredState ? "Light Control" : getLightTooltip()) : ""} isVisible={isLightHovered} />
        <Lightbulb size={24} color={getLightIconColor()} fill={getLightIconFill()} />
      </button>

      {isFloatingBtn && (
        <button className="prevent-miss" style={styles.addUnitFloatingLeftBtn} onClick={actions.addUnit} title="Create New Unit"><Plus size={32} /></button>
      )}

      {selectedUnit && (
        <div style={styles.hudWrapper} className="prevent-miss">
            <div ref={inspectorRef} style={{ ...styles.glassPanel, ...styles.inspectorPanel }} onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
              <div style={styles.panelHeader}>
                <div style={styles.activeIndicator}><div className="blinking-dot" style={styles.statusDot} /><span>UNIT 0{selectedUnitIndex + 1} ACTIVE</span></div>
                <button onClick={() => actions.removeUnit(selectedUnit.id)} style={styles.deleteBtn}><Trash2 size={14} /></button>
              </div>
              
              <div style={styles.accSection}>
                <div style={styles.accListHeader}>ACCESSORY</div>
                {accList.length > 0 ? (
                  <div style={styles.accListContainer}>{accList.map(([name, count], i) => (<div key={i} style={styles.accListItem}><span>{name}</span><span style={styles.accListCount}>x{count}</span></div>))}</div>
                ) : (<div style={{ fontSize: 11, color: '#999', fontStyle: 'italic', padding: '4px 0' }}>No accessories added</div>)}
              </div>
              
              <div style={{ width: '100%', height: 1, background: '#e5e5ea', marginBottom: '12px' }} />
              
              <div style={styles.controlRow}><span style={styles.controlLabel}>WIDTH (COLUMNS)</span><div style={{ display:'flex', gap:8 }}><button style={styles.hudBtn} onClick={() => actions.updateColumns(selectedUnit.id, -1)} disabled={selectedUnit.columns <= 1}><Minus size={12} /></button><span style={{ fontFamily:'monospace', fontSize:14, lineHeight:'26px', fontWeight:700 }}>{selectedUnit.columns}</span><button style={styles.hudBtn} onClick={() => actions.updateColumns(selectedUnit.id, 1)} disabled={selectedUnit.columns >= 4}><Plus size={12} /></button></div></div>
              
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
                          <button onClick={() => actions.removeBlock(selectedUnit.id, bIdx)} style={styles.deleteBtn}><Minus size={12} /></button>
                        ) : (
                          <div style={{ ...styles.deleteBtn, opacity: 0, cursor: 'default', pointerEvents: 'none' }} />
                        )}
                      </div>

                      <div style={{ display:'flex', flexDirection:'column-reverse', gap: 8 }}>
                        {block.rows.map((h, rIdx) => {
                          const rowKey = `${selectedUnit.id}-${block.id}-${rIdx}`; 
                          const isEditing = editingId === rowKey; 
                          const isHovered = hoveredStackId === rowKey; 
                          const displayHeight = h ? `${Math.round(h*1000)}mm` : <span style={{ color: '#0066cc', fontWeight: 800 }}>SELECT HEIGHT</span>;

                          return (
                            <div key={rIdx} style={styles.rowWrapper}>
                              {isEditing ? (
                                <div style={styles.editGrid}>{HEIGHT_OPTIONS.map((opt) => (<button key={opt.val} style={{ ...styles.editOptionBtn, ...(h === opt.val ? styles.editOptionBtnActive : {}) }} onClick={() => actions.updateRowHeight(selectedUnit.id, block.id, rIdx, opt.val)}>{opt.label}</button>))}</div>
                              ) : (
                                <div 
                                  onClick={() => setEditingId(rowKey)} 
                                  onMouseEnter={(e) => { e.stopPropagation(); setHoveredStackId(rowKey); }} 
                                  onMouseLeave={(e) => { e.stopPropagation(); setHoveredStackId(null); }} 
                                  style={{ ...styles.rowControl, ...(isHovered ? styles.rowControlHover : {}) }}
                                >
                                  {/* Arrow Indicator */}
                                  <div style={{ position: 'absolute', left: '8px', top: '50%', marginTop: '-7px', opacity: isHovered ? 1 : 0, transform: isHovered ? 'translateX(0)' : 'translateX(-5px)', transition: 'all 0.2s ease', color: '#0066cc', pointerEvents: 'none', display: 'flex', alignItems: 'center' }}>
                                    <ChevronRight size={14} strokeWidth={3} />
                                  </div>

                                  <span style={{ ...styles.stackLabel, transform: isHovered ? 'translateX(16px)' : 'translateX(0)', color: isHovered ? '#0066cc' : '#86868b' }}>L{rIdx + 1}</span>
                                  <div style={styles.stackValue}>
                                    {displayHeight}
                                    {rIdx > 0 ? (
                                      <button onClick={(e) => { e.stopPropagation(); actions.removeRowFromBlock(selectedUnit.id, block.id, rIdx); }} style={{ ...styles.rowDeleteBtn, opacity: isHovered ? 1 : 0, pointerEvents: isHovered ? 'auto' : 'none' }} title="Remove Layer"><Minus size={10} strokeWidth={3} /></button>
                                    ) : (<div style={{ width: 20 }} />)}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                        {block.rows.length < 2 && (
                          <button onClick={() => actions.addRowToBlock(selectedUnit.id, block.id)} style={styles.addRowBtn}><Plus size={12} /> Add Shelf Layer</button>
                        )}
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => actions.addBlockOnTop(selectedUnit.id, 0.384)} style={styles.addStackBtn}><Box size={16} /> ADD NEW STACK MODULE</button>
              </div>
            </div>
          {!isFloatingBtn && (
            <button style={styles.addUnitBlockBtn} onClick={actions.addUnit}><Plus size={18} /> Create New Unit</button>
          )}
        </div>
      )}

      {/* 5. Bottom Dock & Cart */}
      <LayoutGroup>
        <div 
          className="prevent-miss"
          style={{ 
            ...styles.bottomNavContainer, 
            bottom: isDockHovered ? '173px' : '113px', 
            transition: 'bottom 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', 
            zIndex: 50
          }}
        >
          <div style={{ position: 'relative', pointerEvents: 'auto' }}>
            <Tooltip text="ACC Detail" isVisible={isGuideHovered} />
            <motion.button layout style={styles.sideButton} onClick={onGuideOpen} onMouseEnter={() => setIsGuideHovered(true)} onMouseLeave={() => setIsGuideHovered(false)}><FileText size={24} strokeWidth={1.5} /></motion.button>
          </div>

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

          <div style={{ position: 'relative', pointerEvents: 'auto' }}>
            <Tooltip text="Add Cart" isVisible={isCartHovered} />
            <motion.button layout style={styles.cartButton} onClick={actions.handleAddToCart} onMouseEnter={() => setIsCartHovered(true)} onMouseLeave={() => setIsCartHovered(false)}><ShoppingCart size={24} strokeWidth={1.5} /></motion.button>
          </div>
        </div>
      </LayoutGroup>
    </>
  );
}