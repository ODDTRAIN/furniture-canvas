import React, { useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Pages Imports
import Showroom from './pages/Showroom'
import Configurator from './pages/Configurator'
import Space from './pages/Space'

// Global Components Imports
import GlobalDock from './components/GlobalDock'
import CartDrawer from './components/CartDrawer'
import CustomCursor from './components/CustomCursor'
// import CartControl from './components/CartControl'  <-- 삭제됨

export default function App() {
  const containerRef = useRef()

  return (
    <BrowserRouter>
      <div ref={containerRef} className="relative w-full min-h-screen bg-white text-black selection:bg-black selection:text-white overflow-x-hidden">
        
        {/* Dock Navigation */}
        <GlobalDock />

        {/* Global UI */}
        <CartDrawer />
        {/* <CartControl /> <-- 삭제됨 (Global Dock으로 통합) */}
        <CustomCursor />

        <Routes>
          <Route path="/" element={<Showroom containerRef={containerRef} />} />
          <Route path="/configurator" element={
            <div className="relative z-0 h-screen bg-[#f5f5f7]">
              <Configurator />
            </div>
          } />
          <Route path="/space" element={<Space />} />
          <Route path="/vision" element={<div className="h-screen flex items-center justify-center text-2xl font-light">VISION (Coming Soon)</div>} />
        </Routes>

      </div>
    </BrowserRouter>
  )
}