import React, { useMemo, useRef, useEffect, useState } from 'react'
import { View, PerspectiveCamera, ContactShadows, Environment, PresentationControls, useGLTF, Lightformer } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useStore } from '../store/useStore'

const Model = ({ item, isHovered }) => {
  const { scene } = useGLTF(item.modelUrl)
  const clone = useMemo(() => scene.clone(), [scene])
  
  const { setInteractingItem, interactingItem, setActiveItem, setCursorLabel } = useStore()
  const isInteracting = interactingItem === item.id
  
  const pointerStart = useRef({ x: 0, y: 0 })
  const isPressed = useRef(false)

  // [Spring] 호버 애니메이션
  const { scale, position } = useSpring({
    scale: isInteracting ? 19 : (isHovered ? 14 : 13), 
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
  const [isHovered, setIsHovered] = useState(false)

  return (
    <View 
      className={`w-full h-full ${className}`}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      
      {/* 1. 베이스 조명 */}
      <ambientLight intensity={0.9} color="#ffffff" />

      {/* 2. Key Light: 드래그(Interacting) 할 때만 동적 그림자 계산 */}
      <spotLight 
        position={[20, 20, 20]} 
        angle={0.4} 
        penumbra={1} 
        intensity={0.4} 
        castShadow={isInteracting} 
        shadow-bias={-0.0001}
        color="#ffffff"
      />
     
      {/* 3. 보조 조명 */}
      <rectAreaLight 
        width={20} height={20} 
        color={"white"} 
        intensity={0.3} 
        position={[0, 20, 0]} 
        lookAt={[0, 0, 0]} 
      />

      <spotLight position={[0, 10, -25]} intensity={5.0} color="#ffffff" distance={60} />

      {/* [최적화 1] Environment 해상도 조정 (1024 -> 512)
          스테인리스 반사 느낌은 유지하되, 연산량은 1/4로 줄입니다.
      */}
      <Environment resolution={512} blur={0.8}>
        <group rotation={[0, 0, 0]}>
          <Lightformer form="rect" intensity={11} position={[3.2, -8.5, 11.2]} scale={[9, 15.6, 1]} rotation-x={Math.PI / 5} rotation-z={Math.PI / 3} rotation-y={Math.PI / 2.3} target={[0, 0, 0]} />
          <Lightformer form="rect" intensity={1} position={[10, 0, 0]} scale={[20, 15, 1]} rotation-y={Math.PI/2} />
          <Lightformer form="rect" intensity={0.8} position={[-10, 0, 0]} scale={[15, 15, 1]} rotation-y={-Math.PI/2} />
          <Lightformer form="rect" intensity={0.6} position={[8, 0, -8]} scale={[10, 15, 1]} target={[0,0,0]} />
          <Lightformer form="rect" intensity={1} position={[-8, 0, -8]} scale={[12, 15, 1]} target={[0,0,0]} />
          <Lightformer form="rect" intensity={0.5} position={[0, 0, -10]} scale={[4, 15, 1]} rotation-y={Math.PI} />
          <Lightformer form="circle" intensity={1} position={[0, 10, 0]} scale={[5, 5, 1]} rotation-x={Math.PI/2} />
        </group>
      </Environment>

      <PresentationControls
        global={false} 
        cursor={false} 
        snap={true} 
        speed={1.5} 
        zoom={1}
        polar={[-0.1, Math.PI / 4]} 
        azimuth={[-Infinity, Infinity]} 
        config={{ mass: 1, tension: 170, friction: 26 }}
      >
        <Model item={item} isHovered={isHovered} />
      </PresentationControls>

      {/* [최적화 2] ContactShadows Baking (frames={1})
          렉의 주범입니다! frames={1}을 주면, 처음 딱 1번만 그림자를 그리고 
          그 이후에는 이미지처럼 재사용합니다. 호버 시 렉이 완전히 사라질 겁니다.
      */}
      <ContactShadows 
        position={[0, -3.6, 0]} 
        opacity={isInteracting ? 0 : 0.5} 
        scale={30} 
        blur={2.5} 
        far={4} 
        resolution={512} // 해상도 최적화
        frames={1}       // [핵심] 그림자를 구워서 연산 멈춤
        color="#000000"
      />

      <PerspectiveCamera makeDefault fov={20} position={[0, 0, 50]} />
    </View>
  )
}

useGLTF.preload('/models/chair.glb')