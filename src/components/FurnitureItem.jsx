import React, { useMemo, useRef, useEffect, useState } from 'react'
import { View, PerspectiveCamera, ContactShadows, Environment, PresentationControls, useGLTF, Lightformer } from '@react-three/drei'
import { useSpring, animated } from '@react-spring/three'
import { useStore } from '../store/useStore'
import { useFrame } from '@react-three/fiber'

const Model = ({ item, isHovered }) => {
  const { scene } = useGLTF(item.modelUrl)
  const clone = useMemo(() => scene.clone(), [scene])
  
  const { setInteractingItem, interactingItem, setActiveItem, setCursorLabel } = useStore()
  const isInteracting = interactingItem === item.id
  
  const pointerStart = useRef({ x: 0, y: 0 })
  const isPressed = useRef(false)
  
  const groupRef = useRef()

  // [Magnetic Tilt Effect]
  useFrame((state) => {
    if (isHovered && !isInteracting && groupRef.current) {
      const x = state.pointer.x * 0.1
      const y = state.pointer.y * 0.1
      groupRef.current.rotation.x += (-y - groupRef.current.rotation.x) * 0.1
      groupRef.current.rotation.y += (x - groupRef.current.rotation.y) * 0.1
    } else if (!isHovered && groupRef.current) {
      groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * 0.1
      groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * 0.1
    }
  })

  // [Spring Animation]
  const { scale, position } = useSpring({
    scale: isInteracting ? 19 : (isHovered ? 15 : 13),
    // [중요] 인터랙션 시 -6 (지하)으로 이동 -> 그림자 끄는 로직 필수
    position: isInteracting ? [0, -6, 0] : [0, -3.5, 0], 
    config: { mass: 2, tension: 170, friction: 40 }
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
    <group ref={groupRef}>
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
    </group>
  )
}

export default function FurnitureItem({ item, className }) {
  const interactingItem = useStore((state) => state.interactingItem)
  const isInteracting = interactingItem === item.id 
  const [isHovered, setIsHovered] = useState(false)
  
  // [FIX] 그림자 렌더링 준비 상태
  const [shadowReady, setShadowReady] = useState(true)

  useEffect(() => {
    if (isInteracting) {
      // 1. 잡는 순간 그림자 즉시 끄기
      setShadowReady(false)
    } else {
      // 2. 놓는 순간 바로 켜지 말고, 가구가 튀어 올라올 시간(약 550ms)을 기다림
      // 이 딜레이가 없으면 가구가 바닥을 뚫고 있을 때 그림자가 찍혀서 이상하게 나옴
      const timer = setTimeout(() => {
        setShadowReady(true)
      }, 550) 
      return () => clearTimeout(timer)
    }
  }, [isInteracting])

  // [Logic] 
  // shadowReady가 false면(드래그 중 or 복귀 중) -> 연산 0
  // shadowReady가 true면(안착 완료) -> 호버 여부에 따라 1 or Infinity
  const shadowFrames = shadowReady ? (isHovered ? Infinity : 1) : 0;
  const shadowOpacity = shadowReady ? 0.6 : 0;

  return (
    <View 
      className={`w-full h-full ${className}`}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <ambientLight intensity={0.9} color="#ffffff" />
      
      <spotLight 
        position={[20, 20, 20]} 
        angle={0.4} 
        penumbra={1} 
        intensity={0.4} 
        castShadow={isInteracting} 
        shadow-bias={-0.0001}
        color="#ffffff"
      />
     
      <rectAreaLight 
        width={20} height={20} 
        color={"white"} 
        intensity={0.3} 
        position={[0, 20, 0]} 
        lookAt={[0, 0, 0]} 
      />

      <spotLight position={[0, 10, -25]} intensity={5.0} color="#ffffff" distance={60} />

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

      {/* [수정] 딜레이 로직이 적용된 그림자 */}
      <ContactShadows 
        key={shadowReady ? 'ready' : 'hidden'} // [핵심] 상태 변경 시 리셋하여 잔상 제거
        position={[0, -3.6, 0]} 
        opacity={shadowOpacity} 
        scale={40} 
        blur={2} 
        far={4.5} 
        resolution={256} 
        frames={shadowFrames} 
        color="#000000"
      />

      <PerspectiveCamera makeDefault fov={25} position={[0, 0, 45]} />
    </View>
  )
}

useGLTF.preload('/models/chair.glb')