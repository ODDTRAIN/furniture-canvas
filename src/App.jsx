import React, { useRef, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { View, Preload, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'

// Pages
import Showroom from './pages/Showroom'
import Configurator from './pages/Configurator'
// import Space from './pages/Space' (추후 추가)

// Components (UI)
import GlobalDock from './components/GlobalDock'
import CartDrawer from './components/CartDrawer'
import CustomCursor from './components/CustomCursor'
import DetailModal from './components/DetailModal'
import AccessoryGuideModal from './components/AccessoryGuideModal'
import CheckoutModal from './components/CheckoutModal' // [NEW] 체크아웃 추가

// 씬 전환 컨트롤러
function SceneController() {
  const location = useLocation()
  return null
}

export default function App() {
  const containerRef = useRef()

  return (
    <BrowserRouter>
      {/* [ODT Universe Container] */}
      <div ref={containerRef} className="relative w-full min-h-screen bg-white text-black overflow-x-hidden selection:bg-black selection:text-white">
        
        {/* --- Global UI Layer (Z-Index High) --- */}
        <GlobalDock />
        <CartDrawer />
        <DetailModal />
        <AccessoryGuideModal />
        <CheckoutModal /> {/* [NEW] 여기에 배치 */}
        <CustomCursor />

        {/* --- Content Layer (DOM Pages) --- */}
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Showroom />} />
            <Route path="/configurator" element={<Configurator />} />
            {/* <Route path="/space" element={<Space />} /> */}
            <Route path="/vision" element={<div className="h-screen flex items-center justify-center text-2xl font-light">VISION (Coming Soon)</div>} />
          </Routes>
        </div>

        {/* --- The ODT Continuum (Global 3D Layer) --- */}
        <Canvas
          className="fixed inset-0 pointer-events-none"
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
          eventSource={containerRef} // [중요] HTML 요소 위에서도 3D 조작 가능하게 함
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 10], fov: 35 }}
        >
          {/* 각 페이지의 View 컴포넌트들이 렌더링되는 포트 */}
          <View.Port />
          
          <SceneController />
          
          {/* 성능 최적화 */}
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