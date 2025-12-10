import React, { useRef, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { View, Preload, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'

// Pages
import Showroom from './pages/Showroom'
import Configurator from './pages/Configurator'
// [NEW] Zone 3: Space 페이지 임포트
import Space from './pages/Space'

// Components (UI)
import GlobalDock from './components/GlobalDock'
import CartDrawer from './components/CartDrawer'
import DetailModal from './components/DetailModal'
import AccessoryGuideModal from './components/AccessoryGuideModal'
import CheckoutModal from './components/CheckoutModal'
import CustomCursor from './components/CustomCursor'

// [FIX] 페이지 트랜지션 컴포넌트 임포트
import PageTransition from './components/PageTransition'

function SceneController() {
  const location = useLocation()
  return null
}

export default function App() {
  const containerRef = useRef()

  return (
    <BrowserRouter>
      {/* [ODT Universe Container] */}
      <div ref={containerRef} className="relative w-full min-h-screen bg-[#f5f5f7] text-black overflow-x-hidden selection:bg-black selection:text-white">
        
        {/* [FIX] Page Transition Overlay (Highest Priority) */}
        {/* 화면 전환 시 가장 위에서 모든 것을 덮어주는 시네마틱 커튼입니다. */}
        <PageTransition />

        {/* --- Global UI Layer (Z-Index High) --- */}
        <GlobalDock />
        <CartDrawer />
        <DetailModal />
        <AccessoryGuideModal />
        <CheckoutModal />
        <CustomCursor />

        {/* --- Content Layer (DOM Pages) --- */}
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Showroom />} />
            <Route path="/configurator" element={<Configurator />} />
            {/* [NEW] Zone 3: ODT VISION (Space) 연결 */}
            <Route path="/space" element={<Space />} />
            <Route path="/vision" element={<div className="h-screen flex items-center justify-center text-2xl font-light">VISION (Coming Soon)</div>} />
          </Routes>
        </div>

        {/* --- The ODT Continuum (Global 3D Layer) --- */}
        <Canvas
          className="fixed inset-0 pointer-events-none"
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
          eventSource={containerRef}
          shadows
          dpr={[1, 2]}
          // [CRITICAL FIX] preserveDrawingBuffer: true -> 스크린샷 캡처를 위해 필수!
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
          camera={{ position: [0, 0, 10], fov: 35 }}
        >
          <View.Port />
          <SceneController />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <Suspense fallback={null}>
            <Preload all />
          </Suspense>
        </Canvas>

      </div>
    </BrowserRouter>
  )
}