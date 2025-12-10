import React, { useState, useMemo, useRef, useEffect, Suspense } from "react";
import * as THREE from "three";
import { View, OrbitControls, Environment, ContactShadows, Grid, PerspectiveCamera, Html, useProgress, useCursor, Edges, Float } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber"; 
import { useSpring, animated } from '@react-spring/three'; 
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib';

import { 
  getUnitWidth, SIDE_THICK, UNIT_GAP, calculateUnitPrice, isHeightValid, WOOD_THICK, LEG_HEIGHT,
  DEPTH, DICE_SIZE, COLUMN_PITCH, INNER_WIDTH 
} from "../components/configurator/constants";

import { styles } from "../components/configurator/styles";
import { GlobalSelectionMarker, CellSpace } from "../components/configurator/ConfigLogic"; 
import ConfiguratorUI from "../components/configurator/ConfiguratorUI"; 
import { useStore } from "../store/useStore";
import ConfiguratorSaveModal from "../components/ConfiguratorSaveModal";
import AccessoryGuideModal from "../components/AccessoryGuideModal"; 
import { 
  WoodShelf, OuterSteelPanel, VerticalWoodPanel, ComplexColumn, CabinetLight, Dimensions,
  WoodMaterialVertical, UnitLeg 
} from "../components/configurator/ConfigAssets";

import { useConfigurator } from "../hooks/useConfigurator";

function Loader() {
  const { progress } = useProgress()
  return <Html center><div style={{ color: 'black', fontWeight: 800, fontSize: '12px' }}>LOADING {progress.toFixed(0)}%</div></Html>
}

// --- Image Process (Screenshot) ---
const processSquareImage = (sourceUrl, unitW, unitH) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = 1024; 
      const canvas = document.createElement('canvas');
      canvas.width = size; canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, size, size);
      const furnitureAspect = unitW / unitH;
      const imageAspect = img.width / img.height;
      const padding = 0.95;
      let scale;
      if (furnitureAspect > imageAspect) scale = (size * padding) / img.width;
      else scale = (size * padding) / img.height;
      const w = img.width * scale; const h = img.height * scale;
      const x = (size - w) / 2; const y = (size - h) / 2;
      ctx.drawImage(img, x, y, w, h);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = sourceUrl;
  });
};

const ScreenshotHelper = React.forwardRef(({ width, height, gridRef, shadowRef }, ref) => {
  const { gl, scene, camera, controls } = useThree();
  React.useImperativeHandle(ref, () => ({
    capture: async () => {
      const originalPos = camera.position.clone();
      const originalBg = scene.background;
      scene.background = null; gl.setClearColor(0x000000, 0); 
      if (gridRef.current) gridRef.current.visible = false;
      if (shadowRef.current) shadowRef.current.visible = false;
      const center = new THREE.Vector3(0, height / 2, 0);
      const maxDim = Math.max(width, height);
      let distance = Math.abs(maxDim / (2 * Math.tan((camera.fov * (Math.PI / 180)) / 2))) * 1.05;
      distance = Math.max(distance, 1.2);
      camera.position.set(0, height / 2, distance);
      camera.lookAt(center);
      if (controls) controls.target.copy(center);
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL('image/png');
      camera.position.copy(originalPos);
      scene.background = originalBg;
      if (gridRef.current) gridRef.current.visible = true;
      if (shadowRef.current) shadowRef.current.visible = true;
      return await processSquareImage(dataUrl, width, height);
    }
  }));
  return null;
});

const ODTS_ANIM_CONFIG = { mass: 0.5, friction: 28, tension: 400, clamp: true };
const getDeterministicRandomLocal = (seedStr) => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  return (Math.sin(hash) * 10000) - Math.floor(Math.sin(hash) * 10000);
};

// -----------------------------------------------------------------------------
// [NEW] AR Smart Tag Component (Compact & Adjusted)
// -----------------------------------------------------------------------------
const IndicatorTag = ({ position, label }) => {
  return (
    <Html position={position} center distanceFactor={15} zIndexRange={[100, 0]}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px', 
        background: 'rgba(28, 28, 30, 0.75)', 
        backdropFilter: 'blur(10px) saturate(180%)',
        padding: '6px 10px', 
        borderRadius: '8px', 
        boxShadow: '0 4px 16px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1) inset',
        color: 'white',
        transform: 'translate3d(0,0,0)',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        marginTop: '-20px', 
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
      }}>
        <div className="blinking-dot" style={{ 
          width: 6, height: 6, 
          background: '#30D158', 
          borderRadius: '50%',
          boxShadow: '0 0 6px rgba(48, 209, 88, 0.6)' 
        }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
          <span style={{ 
            fontSize: '8px', fontWeight: '700', letterSpacing: '0.05em', 
            color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', lineHeight: 1 
          }}>EDITING</span>
          <span style={{ 
            fontSize: '10px', fontWeight: '600', lineHeight: 1.2, 
            letterSpacing: '0em' 
          }}>{label}</span>
        </div>
      </div>
      
      <div style={{ 
        width: '1px', height: '15px', 
        background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)', 
        margin: '0 auto' 
      }} />
    </Html>
  );
};

// -----------------------------------------------------------------------------
// [NEW] Focus Frame (테두리 하이라이트)
// -----------------------------------------------------------------------------
const FocusFrame = ({ width, height, position, label }) => {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[width + 0.01, height + 0.01, DEPTH + 0.01]} />
        <meshBasicMaterial transparent opacity={0.03} color="#0066cc" depthTest={false} />
        <Edges 
          scale={1} 
          threshold={15} 
          color="#0066cc" 
          renderOrder={1000}
          linewidth={2} 
        />
      </mesh>
      
      <Html position={[-width / 2, height / 2, DEPTH / 2]} center zIndexRange={[100, 0]}>
        <div style={{
          background: '#0066cc',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '8px',
          fontWeight: '800',
          fontFamily: 'monospace',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          whiteSpace: 'nowrap'
        }}>
          {label}
        </div>
      </Html>
    </group>
  );
};

// [FIXED] Block Assembler
const AnimatedBlockAssembler = ({ width, rows, columns, unitId, blockId, accessories, activeTool, onCellClick, isLightOn, isBase, isHighlighted, hoveredRowId, index }) => {
  const { blockOpacity } = useSpring({ from: { blockOpacity: 0 }, to: { blockOpacity: 1 }, config: ODTS_ANIM_CONFIG, delay: index * 20 });
  let currentY = isBase ? LEG_HEIGHT : 0; 
  const elements = [];
  const validRows = rows.filter(r => r !== null);
  const totalH = validRows.reduce((acc, h) => acc + h, 0) + (validRows.length + 1) * WOOD_THICK;
  const backPanelSeed = getDeterministicRandomLocal(`${unitId}-${blockId}-back`);
  
  elements.push(<mesh key="back" position={[0, currentY + totalH/2 - WOOD_THICK/2, -DEPTH/2]} castShadow receiveShadow><boxGeometry args={[width, totalH, 0.005]} /><WoodMaterialVertical seed={backPanelSeed} /></mesh>);
  elements.push(<WoodShelf key="base" width={width} position={[0, currentY + WOOD_THICK/2, 0]} seed={getDeterministicRandomLocal(`${unitId}-${blockId}-base`)} />);
  
  const nodeXArr = Array.from({ length: columns + 1 }, (_, i) => -width/2 + DICE_SIZE/2 + i * COLUMN_PITCH);
  if (isBase) { nodeXArr.forEach((x, i) => { elements.push(<UnitLeg key={`leg-f-${i}`} position={[x, LEG_HEIGHT/2, DEPTH/2 - DICE_SIZE/2]} />); elements.push(<UnitLeg key={`leg-b-${i}`} position={[x, LEG_HEIGHT/2, -(DEPTH/2 - DICE_SIZE/2)]} />); }); }
  
  currentY += WOOD_THICK;
  rows.forEach((h, rIdx) => {
    if (h === null || h === undefined) return; 
    const safeH = h; const rowKey = `${unitId}-${blockId}-${rIdx}`; 
    const showFrame = rowKey === hoveredRowId;
    
    // Focus Frame 표시
    if (showFrame) {
      elements.push(
        <FocusFrame 
          key={`frame-${rowKey}`} 
          width={width}
          height={safeH}
          position={[0, currentY + safeH / 2, 0]} 
          label={`L${rIdx + 1}`}
        />
      );
    }

    const isRowValid = activeTool ? isHeightValid(activeTool, safeH) : false;

    elements.push(<group key={`row-${rIdx}`} position={[0, currentY + safeH/2, 0]}>
      {nodeXArr.map((x, i) => (<group key={`col-${i}`}><ComplexColumn height={safeH} position={[x, 0, DEPTH/2 - DICE_SIZE/2]} /><ComplexColumn height={safeH} position={[x, 0, -(DEPTH/2 - DICE_SIZE/2)]} /></group>))}
      {nodeXArr.map((x, i) => { 
        const panelSeed = getDeterministicRandomLocal(`${unitId}-${blockId}-${rIdx}-panel-${i}`); 
        if(i===0) return <group key={`p-${i}`}><OuterSteelPanel height={safeH} position={[x - DICE_SIZE/2 - SIDE_THICK/2, 0, 0]} /><VerticalWoodPanel height={safeH} position={[x + DICE_SIZE/2 + WOOD_THICK/2, 0, 0]} seed={panelSeed} /></group>; 
        if(i===columns) return <group key={`p-${i}`}><VerticalWoodPanel height={safeH} position={[x - DICE_SIZE/2 - WOOD_THICK/2, 0, 0]} seed={panelSeed} /><OuterSteelPanel height={safeH} position={[x + DICE_SIZE/2 + SIDE_THICK/2, 0, 0]} /></group>; 
        return <group key={`p-${i}`}><VerticalWoodPanel height={safeH} position={[x - DICE_SIZE/2 - WOOD_THICK/2, 0, 0]} seed={panelSeed} /><VerticalWoodPanel height={safeH} position={[x + DICE_SIZE/2 + WOOD_THICK/2, 0, 0]} seed={panelSeed} /></group>; 
      })}
      {Array.from({ length: columns }).map((_, c) => { 
        const centerX = (nodeXArr[c] + nodeXArr[c+1]) / 2; const cellKey = `${blockId}-${rIdx}-${c}`; 
        return (<React.Fragment key={`cell-group-${c}`}>
          {isLightOn && (<CabinetLight key={`l-${c}`} width={INNER_WIDTH} position={[centerX, safeH/2 - 0.01, 0]} hasShelf={accessories?.[cellKey]?.type === 'shelf'} height={safeH} />)}
          <CellSpace key={`c-${c}`} width={INNER_WIDTH} height={safeH} position={[centerX, 0, 0]} accessoryData={accessories?.[cellKey]} activeTool={activeTool} isValid={isRowValid} onInteract={() => onCellClick(unitId, cellKey, safeH)} isHighlighted={null} />
        </React.Fragment>); 
      })}
    </group>);
    currentY += safeH; elements.push(<WoodShelf key={`top-${rIdx}`} width={width} position={[0, currentY + WOOD_THICK/2, 0]} seed={getDeterministicRandomLocal(`${unitId}-${blockId}-${rIdx}-top`)} />); currentY += WOOD_THICK;
  });
  return (<animated.group style={{ opacity: blockOpacity }}><animated.group>{elements}</animated.group></animated.group>);
};

// --- Unit Component ---
const AnimatedUnitAssembler = ({ unit, position, ...props }) => {
  const currentWidth = getUnitWidth(unit.columns);
  const validTotalHeight = unit.blocks.reduce((acc, b) => { const validRows = b.rows.filter(r => r !== null); return acc + validRows.reduce((r, h) => r + h, 0) + (validRows.length * WOOD_THICK) + WOOD_THICK; }, 0) + LEG_HEIGHT;
  const { scaleAnim } = useSpring({ from: { scaleAnim: 0.995 }, to: { scaleAnim: 1 }, config: ODTS_ANIM_CONFIG });
  const [hovered, setHover] = useState(false);
  useCursor(hovered && !props.activeTool);
  let curY = 0;
  return (
    <animated.group position={position} scale={scaleAnim} onClick={(e) => { if (!props.activeTool) { e.stopPropagation(); props.onUnitClick && props.onUnitClick(); } }} onPointerOver={(e) => { if (!props.activeTool) { e.stopPropagation(); setHover(true); } }} onPointerOut={(e) => { if (!props.activeTool) { e.stopPropagation(); setHover(false); } }}>
      {!props.activeTool && (<mesh position={[0, validTotalHeight/2, 0]}><boxGeometry args={[currentWidth + 0.1, validTotalHeight, DEPTH + 0.1]} /><meshBasicMaterial transparent opacity={0} /></mesh>)}
      {unit.blocks.map((block, index) => { const isBase = index === 0; const isHighlighted = block.id === props.hoveredBlockId; const validRows = block.rows.filter(r => r !== null); const blockHeight = validRows.reduce((a, b) => a + b + WOOD_THICK, 0) + WOOD_THICK; const offsetHeight = isBase ? blockHeight + LEG_HEIGHT : blockHeight; const el = (<group key={block.id} position={[0, curY, 0]}><AnimatedBlockAssembler width={currentWidth} rows={block.rows} columns={unit.columns} unitId={unit.id} blockId={block.id} accessories={unit.accessories} activeTool={props.activeTool} onCellClick={props.onCellClick} isLightOn={props.isLightOn} isBase={isBase} isHighlighted={isHighlighted} hoveredRowId={props.hoveredRowId} index={index} /></group>); curY += offsetHeight; return el; })}
      <Dimensions width={currentWidth} height={validTotalHeight} visible={props.showDimensions && (hovered || props.isSelected)} />
      {props.showNames && !(props.showDimensions && (hovered || props.isSelected)) && <Html position={[0, -0.25, 0]} center zIndexRange={[60, 0]}><div style={styles.furnitureTag}>{props.label}</div></Html>}
    </animated.group>
  );
};

const CinematicFocus = ({ selectedUnitId, units, unitPositions, totalWidth, controlsRef, focusState }) => {
  const { camera } = useThree(); 
  const [goal, setGoal] = useState(null);
  useEffect(() => {
    if (!selectedUnitId || !controlsRef.current) return;
    const unit = units.find(u => u.id === selectedUnitId); const pos = unitPositions.find(p => p.id === selectedUnitId);
    if (unit && pos) {
      focusState.current = true; const groupOffsetX = -totalWidth / 2; const absoluteX = pos.x + groupOffsetX;
      const totalH = unit.blocks.reduce((acc, b) => { const validRows = b.rows.filter(r => r !== null); return acc + validRows.reduce((r, h) => r + h + WOOD_THICK, 0) + WOOD_THICK; }, 0) + LEG_HEIGHT;
      const HUD_OFFSET_X = 0.3; const targetVec = new THREE.Vector3(absoluteX + HUD_OFFSET_X, totalH * 0.5, 0);
      const currentCamPos = camera.position.clone(); const currentTarget = controlsRef.current.target.clone();
      const viewDir = new THREE.Vector3().subVectors(currentCamPos, currentTarget).normalize();
      const unitWidth = getUnitWidth(unit.columns); const dist = 4.5 + (unitWidth * 0.5) + (totalH * 0.3); const newCamPos = targetVec.clone().add(viewDir.multiplyScalar(dist));
      setGoal({ target: targetVec, cameraPos: newCamPos });
    }
  }, [selectedUnitId, units, unitPositions, totalWidth, camera, controlsRef, focusState]);
  useFrame((state, delta) => { if (focusState.current && goal && controlsRef.current) { const controls = controlsRef.current; const damp = delta * 1.0; controls.target.lerp(goal.target, damp); camera.position.lerp(goal.cameraPos, damp); if (controls.target.distanceTo(goal.target) < 0.01 && camera.position.distanceTo(goal.cameraPos) < 0.01) { setGoal(null); } controls.update(); } });
  return null;
};

// =============================================================================
// [MAIN COMPONENT] Configurator
// =============================================================================
export default function Configurator() {
  const { 
    units, setUnits, selectedUnitId, setSelectedUnitId, editingId, setEditingId, actions 
  } = useConfigurator();

  const [showDimensions, setShowDimensions] = useState(true);
  const [activeTool, setActiveTool] = useState(null);
  const [lightMode, setLightMode] = useState(0); 
  const isNightMode = lightMode === 1; 
  const isLightOn = lightMode !== 0;   

  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [hoveredStackId, setHoveredStackId] = useState(null); 
  const [hoveredBlockId, setHoveredBlockId] = useState(null); 
  
  const controlsRef = useRef();
  const focusState = useRef(true);
  const screenshotRef = useRef();
  const gridRef = useRef(); 
  const shadowRef = useRef();
  
  const { saveConfiguratorState, configuratorState, addToCart, toggleCart, addToInventory } = useStore();

  useEffect(() => { RectAreaLightUniformsLib.init(); }, []);

  const { unitPositions, totalPrice, totalWidth, totalHeight } = useMemo(() => {
    let accX = 0, price = 0, maxHeight = 0;
    const positions = units.map((u) => {
      const w = getUnitWidth(u.columns); 
      const h = u.blocks.reduce((acc, b) => {
        const validRows = b.rows.filter(r => r !== null);
        return acc + validRows.reduce((r, h) => r + h, 0) + (validRows.length * WOOD_THICK) + WOOD_THICK;
      }, 0) + LEG_HEIGHT;
      if (h > maxHeight) maxHeight = h;
      const fullW = w + SIDE_THICK * 2; 
      const x = accX + fullW / 2; 
      price += calculateUnitPrice(u); 
      accX += fullW + UNIT_GAP; 
      return { id: u.id, x };
    });
    const totalW = accX > 0 ? accX - UNIT_GAP : 0; 
    return { unitPositions: positions, totalPrice: price, totalWidth: totalW, totalHeight: maxHeight };
  }, [units]);

  const markerTarget = useMemo(() => { const unit = units.find(u => u.id === selectedUnitId); if (!unit) return null; const pos = unitPositions.find(p => p.id === unit.id); const x = pos ? pos.x : 0; const h = unit.blocks.reduce((acc, b) => acc + b.rows.reduce((r, h) => r + (h || 0) + WOOD_THICK, 0) + WOOD_THICK, 0) + LEG_HEIGHT; return { x, y: h }; }, [selectedUnitId, units, unitPositions]);

  // [FIX] 중복 생성 방지용 Ref
  const initRef = useRef(false);

  // [FIX] 초기화 로직: 저장된 데이터 확인 후 생성/복원 (Strict Mode 방지)
  useEffect(() => { 
    if (initRef.current) return; // 이미 초기화했으면 중단
    initRef.current = true; // 문 닫음

    if (configuratorState?.units && configuratorState.units.length > 0) { 
      setUnits(configuratorState.units); 
      setSelectedUnitId(configuratorState.units[configuratorState.units.length - 1].id); 
    } else {
      // 저장된 거 없으면 기본 유닛 하나 생성
      actions.addUnit();
    }
    setIsInitialized(true); 
  }, []); 

  useEffect(() => { if (isInitialized && saveConfiguratorState) { saveConfiguratorState(units, totalPrice); } }, [units, totalPrice, isInitialized, saveConfiguratorState]);

  const handleOpenCartModal = async () => { 
    if (units.length === 0) return; 
    if (screenshotRef.current) {
      const thumb = await screenshotRef.current.capture();
      setCapturedImage(thumb);
    }
    setIsSaveModalOpen(true);
  };

  const handleActualAddToCart = () => {
    if (units.length === 0) return; 
    const customProduct = { id: `custom-${Date.now()}`, type: 'custom', name: `Custom Unit (${units.length} Mods)`, price: totalPrice, description: "Custom Configuration from ODT Lab", image: capturedImage, configData: units }; 
    addToCart(customProduct); setIsSaveModalOpen(false); toggleCart(); setCapturedImage(null); 
  };

  const handleSaveAsset = () => { 
    if (units.length === 0) return; 
    const customAsset = { id: `asset-${Date.now()}`, type: 'custom', name: `My Custom Unit`, price: totalPrice, configData: units, modelUrl: null, thumbnail: capturedImage }; 
    addToInventory(customAsset); 
  };

  const combinedActions = {
    ...actions, 
    handleAddToCart: handleOpenCartModal 
  };

  const handleCellClick = (unitId, cellKey, rowHeight) => { 
    if (!activeTool) return; 
    actions.updateAccessory(unitId, cellKey, activeTool, rowHeight);
  };

  const handlePointerMissed = (e) => { 
    if (e.target.closest('.prevent-miss')) return; 
    if (!activeTool) { 
      setSelectedUnitId(null); 
      setEditingId(null); 
      setHoveredStackId(null); 
      setHoveredBlockId(null); 
    } 
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } 
        .rotating-border { animation: spin 4s linear infinite; } 
        .blinking-dot { animation: blink 2s infinite ease-in-out; } 
        @keyframes blink { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>

      <View style={styles.canvasContainer}>
          <color attach="background" args={[isNightMode ? "#111115" : "#f5f5f7"]} />
          <Suspense fallback={<Loader />}>
            <ScreenshotHelper ref={screenshotRef} width={totalWidth} height={totalHeight} gridRef={gridRef} shadowRef={shadowRef} />

            <group>
              <ambientLight intensity={isNightMode ? 0.2 : 0.6} color={isNightMode ? "#b0b0ff" : "#ffffff"} />
              <hemisphereLight skyColor={isNightMode ? "#1a202c" : "#ffffff"} groundColor={isNightMode ? "#000000" : "#f5f5f7"} intensity={isNightMode ? 0.4 : 0.5} />
              <directionalLight position={[-5, 10, 5]} intensity={isNightMode ? 0.3 : 1.5} color={isNightMode ? "#aaccff" : "#ffffff"} castShadow shadow-bias={-0.0001} />
              <spotLight position={[10, 5, 5]} angle={0.5} penumbra={1} intensity={isNightMode ? 0.8 : 1.2} color={isNightMode ? "#ffd7a8" : "#dcebff"} distance={20} />
            </group>
            <Environment preset="city" blur={0.8} environmentIntensity={isNightMode ? 0.2 : 0.9} rotation={[0, Math.PI / 5, 0]} />
            
            <group position={[0, -0.01, 0]} ref={gridRef}> 
              <Grid infiniteGrid cellSize={0.5} sectionSize={2} fadeDistance={20} sectionColor={isNightMode ? "#444" : "#ccc"} cellColor={isNightMode ? "#222" : "#e5e5e5"} /> 
            </group>
            
            <group ref={shadowRef}>
              <ContactShadows resolution={1024} scale={50} blur={2.5} opacity={isNightMode ? 0.5 : 0.3} far={10} color="#000000" frames={1} />
            </group>

            <PerspectiveCamera makeDefault position={[4, 3, 6]} fov={35} />

            <CinematicFocus selectedUnitId={selectedUnitId} units={units} unitPositions={unitPositions} totalWidth={totalWidth} controlsRef={controlsRef} focusState={focusState} />

            <group position={[-totalWidth / 2, 0, 0]} onPointerMissed={handlePointerMissed}>
              {units.map((unit, idx) => (
                <AnimatedUnitAssembler 
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
                  isLightOn={isLightOn} 
                  isNightMode={isNightMode} 
                  hoveredBlockId={hoveredBlockId} 
                  hoveredRowId={hoveredStackId} // HUD 호버 상태 전달
                />
              ))}
              <GlobalSelectionMarker visible={!!markerTarget} x={markerTarget ? markerTarget.x : 0} y={markerTarget ? markerTarget.y : 0} />
            </group>
          </Suspense>
          <OrbitControls ref={controlsRef} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.05} dampingFactor={0.05} enableDamping={true} enablePan={true} panSpeed={1} enabled={true} onStart={() => { focusState.current = false; }} />
      </View>

      <ConfiguratorUI units={units} totalPrice={totalPrice} selectedUnitId={selectedUnitId} activeTool={activeTool} setActiveTool={setActiveTool} editingId={editingId} setEditingId={setEditingId} hoveredStackId={hoveredStackId} setHoveredStackId={setHoveredStackId} setHoveredBlockId={setHoveredBlockId} onGuideOpen={() => setIsAccModalOpen(true)} actions={combinedActions} lightMode={lightMode} setLightMode={setLightMode} />
      <ConfiguratorSaveModal isOpen={isSaveModalOpen} onClose={() => setIsSaveModalOpen(false)} image={capturedImage} onSaveToCart={handleActualAddToCart} onSaveAsset={handleSaveAsset} units={units} totalPrice={totalPrice} />
      <AccessoryGuideModal isOpen={isAccModalOpen} onClose={() => setIsAccModalOpen(false)} />
    </div>
  );
}