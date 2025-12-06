import React from 'react'
import FurnitureGrid from '../components/FurnitureGrid'
import DetailModal from '../components/DetailModal'
import CategoryControl from '../components/CategoryControl'

export default function Showroom() {
  // [혁신] 기존에 있던 Background Canvas를 삭제했습니다.
  // App.jsx의 Global Canvas가 모든 것을 처리합니다.
  
  return (
    <>
      <main className="relative w-full pb-32">
        <FurnitureGrid />
      </main>
      
      <DetailModal />
      <CategoryControl />
    </>
  )
}