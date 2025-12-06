import React, { useState } from 'react'
// [핵심 변경] Canvas -> View
import { View, OrbitControls, TransformControls, ContactShadows, Environment, Grid, PerspectiveCamera } from '@react-three/drei'
import { useStore } from '../store/useStore'
import { RotateCcw, Trash2, Move } from 'lucide-react'
import { useGLTF } from '@react-three/drei'

// --- [Sub Component] 배치된 개별 아이템 ---
function PlacedItem({ item, isSelected, onSelect, onChange }) {
  const { scene } = useGLTF(item.modelUrl || '/models/chair.glb')
  const clone = React.useMemo(() => scene.clone(), [scene])
  
  return (
    <group>
      {isSelected ? (
        <TransformControls mode="translate" onMouseUp={onChange} translationSnap={0.1} rotationSnap={Math.PI / 8}>
           <primitive 
            object={clone} 
            position={item.position} 
            rotation={item.rotation}
            scale={10} 
            onClick={(e) => { e.stopPropagation(); onSelect(item.uid); }}
          />
        </TransformControls>
      ) : (
        <primitive 
          object={clone} 
          position={item.position} 
          rotation={item.rotation}
          scale={10}
          onClick={(e) => { e.stopPropagation(); onSelect(item.uid); }}
        />
      )}
    </group>
  )
}

export default function Space() {
  const { inventory } = useStore()
  const [placedItems, setPlacedItems] = useState([])
  const [selectedUid, setSelectedUid] = useState(null)

  const spawnItem = (asset) => {
    const newItem = { uid: Date.now(), ...asset, position: [0, 0, 0], rotation: [0, 0, 0] }
    setPlacedItems([...placedItems, newItem])
    setSelectedUid(newItem.uid)
  }

  const handleMiss = () => setSelectedUid(null)
  const removeSelected = () => { if (!selectedUid) return; setPlacedItems(placedItems.filter(i => i.uid !== selectedUid)); setSelectedUid(null); }

  return (
    <div className="w-full h-screen bg-[#f5f5f7] relative overflow-hidden">
      
      {/* 1. 3D View Layer (View로 교체) */}
      <View className="absolute inset-0 w-full h-full">
        <color attach="background" args={['#f5f5f7']} />
        <ambientLight intensity={0.8} />
        <Environment preset="city" />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow shadow-bias={-0.0001} />

        <group position={[0, -0.01, 0]}>
          <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
          <Grid infiniteGrid cellSize={1} sectionSize={5} fadeDistance={20} sectionColor="#e5e5e5" cellColor="#f0f0f0" />
        </group>

        {placedItems.map((item) => (
          <PlacedItem key={item.uid} item={item} isSelected={selectedUid === item.uid} onSelect={setSelectedUid} onChange={() => {}} />
        ))}

        <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        <PerspectiveCamera makeDefault position={[5, 5, 5]} fov={45} />
        
        {/* 빈 공간 클릭 처리 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} onClick={handleMiss}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </View>

      {/* 2. HUD Overlay (Title) */}
      <div className="absolute top-8 left-8 pointer-events-none">
        <h1 className="text-sm font-bold tracking-widest text-black uppercase">ODT SPACE</h1>
        <p className="text-[10px] text-gray-500 font-mono mt-1">CANVAS MODE</p>
      </div>

      {/* 3. Control Panel */}
      {selectedUid && (
        <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-4">
          <div className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/50 flex flex-col gap-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Controls</span>
            <button className="p-3 bg-gray-100 rounded-xl hover:bg-black hover:text-white transition-colors"><Move size={20} /></button>
            <button className="p-3 bg-gray-100 rounded-xl hover:bg-black hover:text-white transition-colors"><RotateCcw size={20} /></button>
            <div className="w-full h-px bg-gray-200 my-1"></div>
            <button onClick={removeSelected} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={20} /></button>
          </div>
        </div>
      )}

      {/* 4. Inventory Dock */}
      <InventoryDock inventory={inventory} onSpawn={spawnItem} />
    </div>
  )
}

function InventoryDock({ inventory, onSpawn }) {
  const [isOpen, setIsOpen] = useState(true)
  return (
    <div className={`absolute left-1/2 -translate-x-1/2 bottom-32 z-20 transition-all duration-500 ease-spring ${isOpen ? 'translate-y-0' : 'translate-y-32 opacity-0 pointer-events-none'}`}>
      <div className="bg-white/70 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-4 flex flex-col items-center gap-4">
        <div className="w-12 h-1 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition-colors" onClick={() => setIsOpen(!isOpen)} />
        <div className="flex gap-4 overflow-x-auto max-w-[80vw] px-2 py-2 no-scrollbar">
          {inventory.length === 0 ? (<div className="text-xs text-gray-400 px-8 py-2 font-medium">No assets in Inventory. Go to Showroom to save items.</div>) : (
            inventory.map((item, idx) => (
              <button key={`${item.id}-${idx}`} onClick={() => onSpawn(item)} className="group relative w-16 h-16 bg-white rounded-2xl border border-gray-200 shadow-sm hover:scale-110 hover:shadow-md transition-all flex items-center justify-center shrink-0">
                <div className="text-[10px] font-bold text-gray-800 leading-tight text-center px-1">{item.name.split(' ')[0]}</div>
                <div className="absolute bottom-full mb-2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Click to Place</div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}