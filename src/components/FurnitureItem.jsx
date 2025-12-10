import React, { useMemo, useRef, useEffect, useState } from 'react'
// [FIX] Html 컴포넌트 추가 임포트
import { View, PerspectiveCamera, ContactShadows, Environment, PresentationControls, useGLTF, Lightformer, Html } from '@react-three/drei'
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

  // 자동 데모 모드 감지: 인터랙션 중이지만, 사용자가 누르고 있지는 않음
  const isAutoDemo = isInteracting && !isPressed.current;

  // [Animation Logic]
  useFrame((state) => {
    if (!groupRef.current) return;

    if (isAutoDemo) {
      const time = state.clock.getElapsedTime();
      // 자동 회전 (좌우)
      const targetRotationY = Math.sin(time * 2.5) * 0.35; 
      const targetRotationX = 0.2; 
      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.1;
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1;
    } else if (isHovered && !isInteracting) {
      const x = state.pointer.x * 0.1;
      const y = state.pointer.y * 0.1;
      groupRef.current.rotation.x += (-y - groupRef.current.rotation.x) * 0.1;
      groupRef.current.rotation.y += (x - groupRef.current.rotation.y) * 0.1;
    } else if (!isHovered && !isInteracting) {
      groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * 0.1;
      groupRef.current.rotation.y += (0 - groupRef.current.rotation.y) * 0.1;
    }
  })

  const { scale, position } = useSpring({
    scale: isInteracting ? 19 : (isHovered ? 15 : 13),
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

      {/* [FIX] 데모 모드일 때만 가구 옆에 뜨는 '가짜' 커서 라벨 */}
      {isAutoDemo && (
        <Html position={[0, 0, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.9)', // 커서 배경색
            color: 'white',
            padding: '8px 12px',
            borderRadius: '20px',
            fontSize: '10px',
            fontWeight: '700',
            fontFamily: 'sans-serif',
            whiteSpace: 'nowrap',
            letterSpacing: '0.05em',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transform: 'translate(40px, -40px)', // 가구 중심에서 약간 우상단으로 이동
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}>
            <div>DRAG TO ROTATE</div>
            <div style={{ fontSize: '8px', opacity: 0.7 }}>CLICK FOR DETAILS</div>
          </div>
        </Html>
      )}
    </group>
  )
}

export default function FurnitureItem({ item, className }) {
  const interactingItem = useStore((state) => state.interactingItem)
  const isInteracting = interactingItem === item.id 
  const [isHovered, setIsHovered] = useState(false)
  
  const [shadowReady, setShadowReady] = useState(true)

  useEffect(() => {
    if (isInteracting) {
      setShadowReady(false)
    } else {
      const timer = setTimeout(() => {
        setShadowReady(true)
      }, 550) 
      return () => clearTimeout(timer)
    }
  }, [isInteracting])

  const shadowFrames = shadowReady ? (isHovered ? Infinity : 1) : 0;
  const shadowOpacity = shadowReady ? 0.6 : 0;

  return (
    <View 
      className={`w-full h-full ${className}`}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <color attach="background" args={['#f5f5f7']} />

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

      <ContactShadows 
        key={shadowReady ? 'ready' : 'hidden'} 
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