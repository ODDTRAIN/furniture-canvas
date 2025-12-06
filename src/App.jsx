import React, { useRef, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { View, Preload, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei' // [안정성 패치 1] 모듈 추가

// Pages & Components
import Showroom from './pages/Showroom'
import Configurator from './pages/Configurator'
import Space from './pages/Space'
import GlobalDock from './components/GlobalDock'
import CartDrawer from './components/CartDrawer'
import CustomCursor from './components/CustomCursor'

// 씬 전환 시 부드러운 효과나 공통 환경 설정을 위한 컨트롤러
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
        <CustomCursor />

        {/* --- Content Layer (DOM Pages) --- */}
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Showroom />} />
            <Route path="/configurator" element={<Configurator />} />
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
          dpr={[1, 2]} // 픽셀 비율 1~2배 사이 유동적 조절
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <View.Port />
          
          <SceneController />
          
          {/* [안정성 패치 2] 성능 자동 최적화 */}
          <AdaptiveDpr pixelated /> {/* 프레임 떨어지면 해상도 일시 조정 */}
          <AdaptiveEvents /> {/* 부하 걸리면 이벤트 빈도 조절 */}
          
          <Suspense fallback={null}>
            <Preload all />
          </Suspense>
        </Canvas>

      </div>
    </BrowserRouter>
  )
}