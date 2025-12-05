import React, { useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Pages Imports
import Showroom from './pages/Showroom'      // Page 1 (CatalogPage)
import Configurator from './pages/Configurator' // Page 2 (3D Builder)

// Global Components Imports
import GlobalDock from './components/GlobalDock'
import CartDrawer from './components/CartDrawer'
import CartControl from './components/CartControl'
import CustomCursor from './components/CustomCursor'

export default function App() {
  const containerRef = useRef()

  return (
    <BrowserRouter>
      <div ref={containerRef} className="relative w-full min-h-screen bg-white text-black selection:bg-black selection:text-white overflow-x-hidden">
        
        {/* Dock Navigation */}
        <GlobalDock />

        {/* Global UI */}
        <CartDrawer />
        <CartControl />
        <CustomCursor />

        <Routes>
          {/* 1. Main Showroom (가구 그리드 & 디테일 모달) */}
          <Route path="/" element={<Showroom containerRef={containerRef} />} />
          
          {/* 2. Atelier (3D Configurator) */}
          <Route path="/configurator" element={
            <div className="relative z-0 h-screen bg-[#f5f5f7]">
              <Configurator />
            </div>
          } />
          
          {/* 3. Placeholder Pages */}
          <Route path="/space" element={<div className="h-screen flex items-center justify-center text-2xl font-light">ODT SPACE (Coming Soon)</div>} />
          <Route path="/vision" element={<div className="h-screen flex items-center justify-center text-2xl font-light">VISION (Coming Soon)</div>} />
        </Routes>

      </div>
    </BrowserRouter>
  )
}