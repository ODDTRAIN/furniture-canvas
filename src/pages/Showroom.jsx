import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { View, Preload } from '@react-three/drei'

// 기존 컴포넌트 경로 유지 (src/pages/ 안에 있으므로 ../components/ 로 접근)
import FurnitureGrid from '../components/FurnitureGrid'
import DetailModal from '../components/DetailModal'
import CategoryControl from '../components/CategoryControl'

export default function Showroom({ containerRef }) {
  return (
    <>
      <main className="relative z-10 pb-32"> {/* Dock 공간 확보 */}
        <FurnitureGrid />
      </main>
      
      <DetailModal />
      <CategoryControl />
      
      {/* Background Canvas for View tracking */}
      <Canvas
        className="fixed inset-0 pointer-events-none"
        eventSource={containerRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
        shadows
        camera={{ position: [0, 0, 10], fov: 45 }}
      >
        <Suspense fallback={null}>
          <View.Port />
          <Preload all />
        </Suspense>
      </Canvas>
    </>
  )
}