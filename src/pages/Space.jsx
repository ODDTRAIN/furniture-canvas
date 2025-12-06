import React, { Suspense, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, TransformControls, ContactShadows, Environment, Grid, AccumulativeShadows, RandomizedLight } from '@react-three/drei'
import { useStore } from '../store/useStore'
import { Save, RotateCcw, Trash2, MousePointer2, Move } from 'lucide-react'
import * as THREE from 'three'

// 가구 모델을 불러오는 컴포넌트 (Zone 1/2의 모델 재사용)
import { useGLTF } from '@react-three/drei'

// --- [Sub Component] 배치된 개별 아이템 ---
function PlacedItem({ item, isSelected, onSelect, onChange }) {
  const { scene } = useGLTF(item.modelUrl || '/models/chair.glb') // 모델 없으면 기본 의자
  const clone = React.useMemo(() => scene.clone(), [scene])
  
  return (
    <group>
      {isSelected ? (
        <TransformControls mode="translate" onMouseUp={onChange} translationSnap={0.1} rotationSnap={Math.PI / 8}>
           <primitive 
            object={clone} 
            position={item.position} 
            rotation={item.rotation}
            scale={10} // Zone 1,2 스케일에 맞춰 조정
            onClick={(e) => {
              e.stopPropagation()
              onSelect(item.uid)
            }}
          />
        </TransformControls>
      ) : (
        <primitive 
          object={clone} 
          position={item.position} 
          rotation={item.rotation}
          scale={10}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(item.uid)
          }}
        />
      )}
    </group>
  )
}

export default function Space() {
  const { inventory } = useStore()
  
  // 배치된 아이템들 상태 관리
  // 구조: { uid: number, assetId: number, position: [x,y,z], rotation: [x,y,z] }
  const [placedItems, setPlacedItems] = useState([])
  const [selectedUid, setSelectedUid] = useState(null)

  // 인벤토리에서 아이템 꺼내기 (Spawn)
  const spawnItem = (asset) => {
    const newItem = {
      uid: Date.now(), // 고유 ID
      ...asset,
      position: [0, 0, 0],
      rotation: [0, 0, 0]
    }
    setPlacedItems([...placedItems, newItem])
    setSelectedUid(newItem.uid)
  }

  // 선택 해제
  const handleMiss = () => setSelectedUid(null)

  // 아이템 삭제
  const removeSelected = () => {
    if (!selectedUid) return
    setPlacedItems(placedItems.filter(i => i.uid !== selectedUid))
    setSelectedUid(null)
  }

  return (
    <div className="w-full h-screen bg-[#f5f5f7] relative overflow-hidden">
      
      {/* 1. 3D Canvas */}
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 45 }}>
        <color attach="background" args={['#f5f5f7']} />
        
        {/* Apple Studio Lighting */}
        <ambientLight intensity={0.8} />
        <Environment preset="city" />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={1} 
          castShadow 
          shadow-bias={-0.0001}
        />

        {/* 바닥 그림자 & 그리드 */}
        <group position={[0, -0.01, 0]}>
          <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
          <Grid infiniteGrid cellSize={1} sectionSize={5} fadeDistance={20} sectionColor="#e5e5e5" cellColor="#f0f0f0" />
        </group>

        {/* 배치된 아이템 렌더링 */}
        {placedItems.map((item) => (
          <PlacedItem 
            key={item.uid} 
            item={item} 
            isSelected={selectedUid === item.uid}
            onSelect={setSelectedUid}
            onChange={() => {}} // 나중에 위치 저장 로직 연결
          />
        ))}

        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        
        {/* 빈 공간 클릭 시 선택 해제 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} onClick={handleMiss}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </Canvas>

      {/* 2. HUD Overlay (Title) */}
      <div className="absolute top-8 left-8 pointer-events-none">
        <h1 className="text-sm font-bold tracking-widest text-black uppercase">ODT SPACE</h1>
        <p className="text-[10px] text-gray-500 font-mono mt-1">CANVAS MODE</p>
      </div>

      {/* 3. Control Panel (선택되었을 때만 등장) */}
      {selectedUid && (
        <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-4">
          <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/50 flex flex-col gap-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Controls</span>
            
            <button className="p-3 bg-gray-100 rounded-xl hover:bg-black hover:text-white transition-colors" title="Move">
              <Move size={20} />
            </button>
            <button className="p-3 bg-gray-100 rounded-xl hover:bg-black hover:text-white transition-colors" title="Rotate">
              <RotateCcw size={20} />
            </button>
            <div className="w-full h-px bg-gray-200 my-1"></div>
            <button 
              onClick={removeSelected}
              className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors" 
              title="Delete"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      )}

      {/* 4. Inventory Dock (Bottom) */}
      <InventoryDock inventory={inventory} onSpawn={spawnItem} />

    </div>
  )
}

// --- [Internal Component] Inventory Dock ---
function InventoryDock({ inventory, onSpawn }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={`
      absolute left-1/2 -translate-x-1/2 bottom-32 z-20 
      transition-all duration-500 ease-spring
      ${isOpen ? 'translate-y-0' : 'translate-y-32 opacity-0 pointer-events-none'}
    `}>
      <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-4 flex flex-col items-center gap-4">
        
        {/* Handle / Title */}
        <div 
          className="w-12 h-1 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        />
        
        {/* List */}
        <div className="flex gap-4 overflow-x-auto max-w-[80vw] px-2 py-2 no-scrollbar">
          {inventory.length === 0 ? (
            <div className="text-xs text-gray-400 px-8 py-2 font-medium">
              No assets in Inventory. Go to Showroom to save items.
            </div>
          ) : (
            inventory.map((item, idx) => (
              <button 
                key={`${item.id}-${idx}`}
                onClick={() => onSpawn(item)}
                className="group relative w-16 h-16 bg-white rounded-2xl border border-gray-200 shadow-sm hover:scale-110 hover:shadow-md transition-all flex items-center justify-center shrink-0"
              >
                {/* 썸네일 대신 텍스트/아이콘 (추후 이미지로 교체) */}
                <div className="text-[10px] font-bold text-gray-800 leading-tight text-center px-1">
                  {item.name.split(' ')[0]}
                </div>
                
                {/* Hover Tooltip */}
                <div className="absolute bottom-full mb-2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Click to Place
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}