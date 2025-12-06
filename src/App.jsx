import React, { useRef, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { View, Preload } from '@react-three/drei'

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
  // 추후 라우트 변경 감지하여 카메라 무빙 연출 추가 가능
  return null
}

export default function App() {
  const containerRef = useRef()

  return (
    <BrowserRouter>
      {/* [ODT Universe Container] 
        DOM 이벤트의 기준점이자, 전체 앱을 감싸는 컨테이너
      */}
      <div ref={containerRef} className="relative w-full min-h-screen bg-white text-black overflow-x-hidden selection:bg-black selection:text-white">
        
        {/* --- Global UI Layer (Z-Index High) --- */}
        <GlobalDock />
        <CartDrawer />
        <CustomCursor />

        {/* --- Content Layer (DOM Pages) --- */}
        {/* 각 페이지는 이제 Canvas를 직접 갖지 않고, <View>를 통해 영역만 지정합니다. */}
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Showroom />} />
            <Route path="/configurator" element={<Configurator />} />
            <Route path="/space" element={<Space />} />
            <Route path="/vision" element={<div className="h-screen flex items-center justify-center text-2xl font-light">VISION (Coming Soon)</div>} />
          </Routes>
        </div>

        {/* --- The ODT Continuum (Global 3D Layer) --- */}
        {/* 이곳이 유일한 Canvas입니다. 
            페이지 곳곳에 흩어진 <View> 컴포넌트들이 
            이곳의 <View.Port />로 텔레포트되어 렌더링됩니다.
        */}
        <Canvas
          className="fixed inset-0 pointer-events-none"
          style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
          eventSource={containerRef}
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <View.Port />
          
          <SceneController />
          
          <Suspense fallback={null}>
            <Preload all />
          </Suspense>
        </Canvas>

      </div>
    </BrowserRouter>
  )
}