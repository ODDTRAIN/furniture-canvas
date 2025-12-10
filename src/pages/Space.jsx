import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, SoftShadows, Html, ContactShadows, Edges, Gltf } from '@react-three/drei';
import { ChevronLeft, Move, RotateCw, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/three';
import * as THREE from 'three';

import StudioRoom from '../components/space/StudioRoom';
import SpaceHUD from '../components/space/SpaceHUD';
import ControlIsland from '../components/space/ControlIsland';
import SmartGizmo from '../components/space/SmartGizmo';
import UnitRenderer from '../components/space/UnitRenderer';
import PropBox from '../components/space/PropBox';

// [HELPER] Dimension Logic (파트너님 기존 코드 유지)
export const getItemDimensions = (item) => {
  if (item.type === 'column') {
    return { w: item.width, h: 3, d: item.depth }; 
  }
  if (item.type !== 'custom') {
    if (item.width && item.height && item.depth) {
      return { w: item.width, h: item.height, d: item.depth };
    }
    return { w: 1, h: 1, d: 1 }; 
  }
  if (item.configData && item.configData.length > 0) {
    const unit = item.configData[0];
    const realWidth = 0.450 + ((unit.columns - 1) * 0.425);
    const realDepth = 0.285;
    let realHeight = 0.15; 
    if (unit.blocks) {
      unit.blocks.forEach(block => {
        realHeight += 0.02; 
        block.rows.forEach(rowH => {
          realHeight += (rowH || 0); 
          realHeight += 0.02; 
        });
      });
    } else {
      realHeight = 1.0;
    }
    realHeight += 0.02; 
    return { w: realWidth, h: realHeight, d: realDepth };
  }
  return { w: 1, h: 1, d: 1 };
};

// [UI] Context Menu
function ObjectContextMenu({ onModeChange, onDelete, currentMode, onClose }) {
  return (
    <div className="flex flex-col items-center transform -translate-x-1/2 -translate-y-full pb-3 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1 bg-[#1d1d1f]/90 backdrop-blur-2xl p-1.5 rounded-full shadow-2xl border border-white/10 animate-in fade-in zoom-in duration-200 origin-bottom scale-95 hover:scale-100 transition-transform">
        <button onClick={(e) => { e.stopPropagation(); onModeChange('translate'); }} className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${currentMode === 'translate' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'}`} title="Move"><Move size={14} strokeWidth={2.5} /></button>
        <button onClick={(e) => { e.stopPropagation(); onModeChange('rotate'); }} className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center ${currentMode === 'rotate' ? 'bg-white text-black shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/10'}`} title="Rotate"><RotateCw size={14} strokeWidth={2.5} /></button>
        <div className="w-[1px] h-3 bg-white/10 mx-0.5" />
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-full text-[#FF453A] hover:bg-[#FF453A]/20 transition-all duration-200 flex items-center justify-center" title="Delete"><Trash2 size={14} strokeWidth={2.5} /></button>
        {/* [FIX] 여기에 e.stopPropagation() 추가하여 배경 클릭과 분리 */}
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200 flex items-center justify-center" title="Close"><X size={14} strokeWidth={2.5} /></button>
      </div>
      <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#1d1d1f]/90 relative -top-[1px]" />
    </div>
  );
}

// -----------------------------------------------------------------------------
// [COMPONENT] Furniture Object (기존 로직 100% 유지)
// -----------------------------------------------------------------------------
const FurnitureObject = React.forwardRef(({ item, isSelected, isDragging, onClick, onMenuAction, gizmoMode, onUpdateName, isLightOn, roomHeight, onSizeChange }, ref) => {
  const contentRef = useRef();
  const [displaySize, setDisplaySize] = useState([1, 1, 1]); 
  const [centerOffset, setCenterOffset] = useState([0, 0.5, 0]);
  const mathDims = useMemo(() => getItemDimensions(item), [item]);

  useLayoutEffect(() => {
    // 드래그 중 계산 금지
    if (isDragging) return;

    // A. Zone 2 (Custom)
    if (item.type === 'custom') {
      setDisplaySize([mathDims.w, mathDims.h, mathDims.d]);
      setCenterOffset([0, mathDims.h / 2, 0]);
      onSizeChange(item.uid, { width: mathDims.w, height: mathDims.h, depth: mathDims.d });
    } 
    // B. Zone 1 (Product / GLB) - [기존 로직 유지]
    else if (item.type === 'product' && contentRef.current) {
      const box = new THREE.Box3().setFromObject(contentRef.current);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center); 

      // 크기가 유효할 때만 업데이트
      if (size.x > 0.01 && size.y > 0.01) {
        let localCenter = new THREE.Vector3(0, size.y / 2, 0);
        if (ref.current) localCenter = ref.current.worldToLocal(center.clone());

        let rawX = size.x - 0.001 - 0.006; 
        let rawZ = size.z - 0.001;
        if (Math.abs(rawZ - 0.285) < 0.015) rawZ = 0.285;
        
        const STANDARD_WIDTHS = [0.450, 0.875, 1.300, 1.725, 2.150];
        let finalWidth = rawX;
        for (let standard of STANDARD_WIDTHS) {
          if (Math.abs(rawX - standard) < 0.02) {
            finalWidth = standard;
            break;
          }
        }
        setDisplaySize([finalWidth, size.y, rawZ]);
        setCenterOffset([localCenter.x, size.y / 2, localCenter.z]);
        onSizeChange(item.uid, { width: finalWidth, height: size.y, depth: rawZ });
      }
    }
    // C. Column
    else if (item.type === 'column') {
      const h = roomHeight + 0.1;
      setDisplaySize([item.width, h, item.depth]);
      setCenterOffset([0, h / 2, 0]);
    }
  }, [item, isLightOn, mathDims, roomHeight, isDragging]); 

  const { springScale, springY, springRot } = useSpring({
    springScale: isDragging ? 1.02 : 1,
    springY: isDragging ? 0.2 : 0, 
    springRot: isDragging ? 0.02 : 0, 
    config: { mass: 1, tension: 400, friction: 30 }
  });

  return (
    <animated.group 
      ref={ref} 
      position-x={item.position[0]}
      position-z={item.position[2]}
      position-y={springY} 
      rotation={item.rotation} 
      rotation-z={springRot}
      scale={springScale}
      onClick={onClick}
    >
      {isSelected && !isDragging && (
        <Html 
          center={false}
          position={[centerOffset[0], displaySize[1] + 0.15, centerOffset[2]]} 
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }} 
        >
          <ObjectContextMenu 
            currentMode={gizmoMode}
            onModeChange={(mode) => onMenuAction('mode', mode)}
            onDelete={() => onMenuAction('delete')}
            onClose={() => onMenuAction('close')}
          />
        </Html>
      )}

      <group ref={contentRef}>
        {item.type === 'custom' ? (
          <group>
             {item.configData && item.configData.map((unitData, idx) => (
               <group key={idx}>
                 <UnitRenderer unit={unitData} isLightOn={isLightOn} />
               </group>
             ))}
          </group>
        ) : item.type === 'product' && item.modelUrl ? (
          <Gltf src={item.modelUrl} castShadow receiveShadow />
        ) : item.type === 'column' ? (
          <mesh position={[0, roomHeight/2, 0]} castShadow receiveShadow>
            <boxGeometry args={[item.width, roomHeight + 0.1, item.depth]} />
            <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
          </mesh>
        ) : (
          <PropBox item={item} isSelected={isSelected} updateItemName={onUpdateName} />
        )}
      </group>

      {isSelected && (
        <mesh position={centerOffset}>
          <boxGeometry args={displaySize} /> 
          <meshBasicMaterial visible={false} />
          <Edges scale={1} threshold={30} color="white" renderOrder={1000} opacity={0.8} />
        </mesh>
      )}

      <mesh position={centerOffset} visible={false}>
        <boxGeometry args={displaySize} />
      </mesh>

      <animated.mesh position={[0, -springY, 0]} rotation={[-Math.PI/2, 0, 0]} position-y={springY.to(y => -y + 0.005)}>
        <planeGeometry args={[displaySize[0] + 0.1, displaySize[2] + 0.1]} /> 
        <animated.meshBasicMaterial color="#000" opacity={springY.to(y => y * 0.3)} transparent depthWrite={false} />
      </animated.mesh>
    </animated.group>
  );
});

// [MAIN] Space Page
export default function Space() {
  const navigate = useNavigate();
  const containerRef = useRef();
  const controlsRef = useRef();
  
  const [activeTab, setActiveTab] = useState('SPACE'); 
  const [roomSize, setRoomSize] = useState({ width: 6.4, depth: 8.4, height: 3 }); 
  const [wallCount, setWallCount] = useState(2); 
  const [activeWalls, setActiveWalls] = useState({ back: true, left: true, right: false, front: false });
  const [columns, setColumns] = useState([]);

  const [placedItems, setPlacedItems] = useState([]); 
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [gizmoMode, setGizmoMode] = useState("translate");
  const [isItemDragging, setIsItemDragging] = useState(false);
  const [areLightsOn, setAreLightsOn] = useState(false); 

  const itemsRef = useRef({}); 

  const handleAddItem = (inventoryItem) => {
    const isPropAdd = !inventoryItem; 
    let itemType = 'prop';
    if (!isPropAdd) {
      if (inventoryItem.configData) { itemType = 'custom'; } 
      else { itemType = 'product'; }
    }
    const safeModelUrl = inventoryItem?.modelUrl || '/chair.glb'; 

    const newItem = {
      uid: Date.now(),
      type: itemType,
      name: isPropAdd ? 'New Prop' : inventoryItem.name,
      configData: isPropAdd ? null : inventoryItem.configData, 
      modelUrl: itemType === 'product' ? safeModelUrl : null, 
      position: [0, 0, 0], 
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      width: 1, height: 1, depth: 1 
    };
    setPlacedItems([...placedItems, newItem]);
    setSelectedItemId(newItem.uid);
    setGizmoMode("translate");
    setActiveTab('LAYOUT');
  };

  const handleMenuAction = (action, value) => {
    if (action === 'mode') setGizmoMode(value);
    if (action === 'delete') {
      const isColumn = columns.some(c => c.id === selectedItemId || `col-${c.id}` === String(selectedItemId));
      if (isColumn) {
        setColumns(prev => prev.filter(c => c.id !== selectedItemId && `col-${c.id}` !== selectedItemId));
      } else {
        setPlacedItems(prev => prev.filter(item => item.uid !== selectedItemId));
      }
      setSelectedItemId(null);
    }
    // [FIX] X 버튼 누르면 선택 해제
    if (action === 'close') setSelectedItemId(null);
  };

  const handleUpdateItemName = (uid, newName) => {
    setPlacedItems(prev => prev.map(item => item.uid === uid ? { ...item, name: newName } : item));
  };

  const handleUpdateItemSize = (uid, size) => {
    setPlacedItems(prev => prev.map(item => {
      if (item.uid === uid && (Math.abs(item.width - size.width) > 0.01)) {
        return { ...item, ...size }; 
      }
      return item;
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!selectedItemId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') handleMenuAction('delete');
      if (e.key.toLowerCase() === 't') setGizmoMode("translate");
      if (e.key.toLowerCase() === 'r') setGizmoMode("rotate");
      if (e.key === 'Escape') setSelectedItemId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId]);

  const allInteractiveItems = [
    ...placedItems,
    ...columns.map((col, idx) => ({ 
      ...col, 
      uid: col.id ? `col-${col.id}` : `col-idx-${idx}`, 
      type: 'column', 
      name: `Column`,
      position: [col.x, 0, col.z],
      rotation: col.rotation || [0, 0, 0] 
    })) 
  ];

  const handleSetAllItems = (updater) => {
    const nextList = typeof updater === 'function' ? updater(allInteractiveItems) : updater;
    const nextPlacedItems = [];
    const nextColumns = [];

    nextList.forEach(item => {
      if (item.type === 'column') {
        const originalId = item.uid.replace('col-', '').replace('idx-', '');
        const existingCol = columns.find(c => String(c.id) === originalId || (c.id === undefined)) || {};
        nextColumns.push({
          ...existingCol,
          id: existingCol.id || originalId,
          x: item.position[0], 
          z: item.position[2],
          rotation: item.rotation,
          width: item.width,
          depth: item.depth
        });
      } else {
        nextPlacedItems.push(item);
      }
    });

    setPlacedItems(nextPlacedItems);
    if (nextColumns.length === columns.length) { 
        setColumns(nextColumns);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-[#111] text-white overflow-hidden font-sans">
      <div className="absolute top-0 left-0 right-0 z-50 flex justify-between items-start p-8 pointer-events-none">
        <button onClick={() => navigate('/')} className="pointer-events-auto group flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 transition-all">
          <ChevronLeft size={16} className="text-white/60 group-hover:text-white" />
          <span className="text-xs font-bold tracking-widest text-white/80 group-hover:text-white uppercase">Exit</span>
        </button>
        <div className="flex flex-col items-end">
          <h1 className="text-3xl font-black tracking-tighter text-white mix-blend-difference">ODT VISION</h1>
          <div className="flex items-center gap-2 mt-1 opacity-50">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase">Studio Active</span>
          </div>
        </div>
      </div>

      <SpaceHUD roomSize={roomSize} />

      <Canvas
        className="w-full h-full"
        shadows
        dpr={[1, 2]}
        gl={{ preserveDrawingBuffer: true, antialias: true, toneMappingExposure: 1.2 }}
        camera={{ position: [8, 8, 10], fov: 45 }}
        onPointerMissed={(e) => { if(e.type === 'click') setSelectedItemId(null); }}
      >
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={0.5} intensity={2} castShadow shadow-bias={-0.0001} />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#dcebff" />
        <Environment preset="city" blur={0.8} />
        <SoftShadows size={10} focus={0} samples={16} />
        <ContactShadows resolution={1024} scale={50} blur={2.5} opacity={0.5} far={1} color="#000000" position={[0, 0.001, 0]} />
        
        <StudioRoom roomSize={roomSize} activeWalls={activeWalls} columns={[]} /> 

        {allInteractiveItems.map((item) => (
          <FurnitureObject
            key={item.uid}
            ref={(el) => (itemsRef.current[item.uid] = el)}
            item={item}
            isSelected={selectedItemId === item.uid}
            isDragging={selectedItemId === item.uid && isItemDragging}
            gizmoMode={gizmoMode}
            isLightOn={areLightsOn}
            roomHeight={roomSize.height} 
            onClick={(e) => { e.stopPropagation(); setSelectedItemId(item.uid); }}
            onMenuAction={handleMenuAction}
            onUpdateName={handleUpdateItemName}
            onSizeChange={handleUpdateItemSize}
          />
        ))}

        <SmartGizmo 
          selectedItemId={selectedItemId}
          placedItems={allInteractiveItems}
          setPlacedItems={handleSetAllItems}
          mode={gizmoMode}
          roomSize={roomSize}
          onTransformStart={() => { 
            if(controlsRef.current) controlsRef.current.enabled = false; 
            setIsItemDragging(true);
          }}
          onTransformEnd={() => { 
            if(controlsRef.current) controlsRef.current.enabled = true; 
            setIsItemDragging(false); 
          }}
        />

        <OrbitControls ref={controlsRef} makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 - 0.1} dampingFactor={0.05} />
      </Canvas>

      <ControlIsland 
        activeTab={activeTab} setActiveTab={setActiveTab}
        roomSize={roomSize} setRoomSize={setRoomSize}
        activeWalls={activeWalls} setActiveWalls={setActiveWalls}
        columns={columns} setColumns={setColumns}
        onAddItem={handleAddItem}
        areLightsOn={areLightsOn} setAreLightsOn={setAreLightsOn}
      />
    </div>
  );
}