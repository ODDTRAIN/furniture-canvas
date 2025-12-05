import React, { useMemo, useRef, useEffect } from 'react'
import { View, PerspectiveCamera, ContactShadows, Environment, PresentationControls, useGLTF, Lightformer } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useStore } from '../store/useStore'

const Model = ({ item }) => {
  const { scene } = useGLTF(item.modelUrl)
  const clone = useMemo(() => scene.clone(), [scene])
  
  const { setInteractingItem, interactingItem, setActiveItem, setCursorLabel } = useStore()
  const isInteracting = interactingItem === item.id
  
  const pointerStart = useRef({ x: 0, y: 0 })
  const isPressed = useRef(false)

  const { scale, position } = useSpring({
    scale: isInteracting ? 19 : 13, 
    position: isInteracting ? [0, -6, 0] : [0, -3.5, 0], 
    config: { mass: 1, tension: 170, friction: 26 }
  })

  useEffect(() => {
    const handleGlobalPointerUp = (e) => {
      if (!isPressed.current) return
      isPressed.current = false
      setInteractingItem(null)
      document.body.style.cursor = 'auto'
      const dist = Math.sqrt(Math.pow(e.clientX - pointerStart.current.x, 2) + Math.pow(e.clientY - pointerStart.current.y, 2))
      if (dist < 10) setActiveItem(item)
    }
    window.addEventListener('pointerup', handleGlobalPointerUp)
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp)
  }, [item, setActiveItem, setInteractingItem])

  const handlePointerDown = (e) => {
    isPressed.current = true
    setInteractingItem(item.id)
    pointerStart.current = { x: e.clientX, y: e.clientY }
    document.body.style.cursor = 'grabbing'
    setCursorLabel(null)
  }

  return (
    <animated.primitive 
      object={clone}
      scale={scale}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerOver={() => {
        document.body.style.cursor = 'grab'
        setCursorLabel(true) 
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
        setCursorLabel(null)
      }}
    />
  )
}

export default function FurnitureItem({ item, className }) {
  const interactingItem = useStore((state) => state.interactingItem)
  const isInteracting = interactingItem === item.id

  return (
    <View className={`w-full h-full ${className}`}>
      
      {/* ================================================================
          💡 [THE GOLDEN BALANCE] 
          정면은 "반사판"으로 그라데이션을 만들고, 
          회전은 "측후면 기둥"으로 밝기를 유지합니다.
         ================================================================ */}
      
      {/* 1. 베이스: 확 낮춤 (하얗게 뜨는 현상 방지) */}
      <ambientLight intensity={0.9} color="#ffffff" />

      {/* 2. Key Light: 우측 상단 (입체감만 살림) */}
      <spotLight 
        position={[20, 20, 20]} 
        angle={0.4} 
        penumbra={1} 
        intensity={0.4} 
        castShadow 
        color="#ffffff"
      />
     
      
      {/* 3. [정면 조명 삭제] -> 대신 은은한 Top Light만 유지 */}
      <rectAreaLight 
        width={20} height={20} 
        color={"white"} 
        intensity={0.3} 
        position={[0, 20, 0]} 
        lookAt={[0, 0, 0]} 
      />

      {/* 4. Rim Light: 뒷면 라인 */}
      <spotLight position={[0, 10, -25]} intensity={5.0} color="#ffffff" distance={60} />


      {/* [환경 맵] 정면 반사판 + 측후면 기둥 */}
      <Environment resolution={1024} blur={0.8}>
        <group rotation={[0, 0, 0]}>
          
          {/* ★ (A) 정면 그라데이션 반사판 (Magic Reflector) ★ */}
          {/* 정면 하단에 배치. 이것 때문에 안쪽 스텐이 '아래 밝음 -> 위 어둠'이 됩니다. */}
          <Lightformer 
            form="rect" 
            intensity={11} 
            position={[3.2, -8.5, 11.2]} 
            scale={[9, 15.6, 1]} 
            rotation-x={Math.PI / 5} /* 45도 눕힘 */
            rotation-z={Math.PI / 3}
             rotation-y={Math.PI / 2.3}
            target={[0, 0, 0]}
          />

          {/* ★ (B) 7 Pillars (수정됨) ★ */}
          {/* 정면을 가리던 기둥들은 옆으로 치우고, 측면/후면만 감쌉니다 */}

          {/* 우측면 (90도) */}
          <Lightformer form="rect" intensity={1} position={[10, 0, 0]} scale={[20, 15, 1]} rotation-y={Math.PI/2} />
          
          {/* 좌측면 (-90도) */}
          <Lightformer form="rect" intensity={0.8} position={[-10, 0, 0]} scale={[15, 15, 1]} rotation-y={-Math.PI/2} />

          {/* 우측 후면 (135도) */}
          <Lightformer form="rect" intensity={0.6} position={[8, 0, -8]} scale={[10, 15, 1]} target={[0,0,0]} />

          {/* 좌측 후면 (-135도) */}
          <Lightformer form="rect" intensity={1} position={[-8, 0, -8]} scale={[12, 15, 1]} target={[0,0,0]} />
          
          {/* 정후면 (180도) */}
          <Lightformer form="rect" intensity={0.5} position={[0, 0, -10]} scale={[4, 15, 1]} rotation-y={Math.PI} />
          
          {/* 천장 */}
          <Lightformer form="circle" intensity={1} position={[0, 10, 0]} scale={[5, 5, 1]} rotation-x={Math.PI/2} />
          
        </group>
      </Environment>

      {/* ================================================================ */}

      <PresentationControls
        global={false} cursor={false} snap={true} speed={1.5} zoom={1}
        polar={[-0.1, Math.PI / 4]} azimuth={[-Infinity, Infinity]} 
      >
        <Model item={item} />
      </PresentationControls>

      <ContactShadows 
        position={[0, -3.6, 0]} 
        opacity={isInteracting ? 0 : 0.5} 
        scale={30} 
        blur={2.5} 
        far={4} 
        color="#000000"
      />

      <PerspectiveCamera makeDefault fov={20} position={[0, 0, 50]} />
    </View>
  )
}

useGLTF.preload('/models/chair.glb')
// ...
