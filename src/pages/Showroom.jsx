import React, { useEffect } from 'react'
import FurnitureGrid from '../components/FurnitureGrid'
import DetailModal from '../components/DetailModal'
import CategoryControl from '../components/CategoryControl'
import { useStore } from '../store/useStore'

export default function Showroom() {
  const { 
    setIsIntroPlaying, 
    setActiveIntroTab, 
    setIsCategoryOpen,
    setInteractingItem, 
    setCursorLabel,
    hasIntroPlayed,      // [NEW] 인트로 재생 여부 확인
    setHasIntroPlayed    // [NEW] 인트로 재생 완료 도장 찍기
  } = useStore()

  useEffect(() => {
    // [핵심] 이미 인트로를 봤다면(true), 아무것도 하지 않고 즉시 종료합니다.
    if (hasIntroPlayed) return;

    // [설정값 유지] 사용자분이 설정하신 빠른 타이밍
    const initialDelay = 1200; 
    const tabs = ['showroom', 'configurator', 'space', 'vision', 'buy'];
    const stepDuration = 1000; 
    const bufferDuration = 500; 
    
    const totalIntroDuration = (tabs.length * stepDuration) + bufferDuration;

    // =================================================================
    // [1부] 인트로 애니메이션
    // =================================================================
    const introTimer = setTimeout(() => {
      // [핵심] 시작과 동시에 '봤음' 처리 -> 다음 방문 시 실행 안 됨
      setHasIntroPlayed(true);

      setIsIntroPlaying(true)
      setIsCategoryOpen(true) 

      tabs.forEach((tab, index) => {
        setTimeout(() => {
          setActiveIntroTab(tab)
        }, index * stepDuration)
      })

      // 1부 종료
      setTimeout(() => {
        setActiveIntroTab(null)
        setIsIntroPlaying(false)
        setIsCategoryOpen(false)
      }, totalIntroDuration)

    }, initialDelay)


    // =================================================================
    // [2부] 인터랙션 데모
    // =================================================================
    const demoStartDelay = initialDelay + totalIntroDuration + 500;

    const demoTimer = setTimeout(() => {
      const targetItemId = 2; // 타겟 가구 ID

      // 가구 띄우기 (회전 시작)
      // FurnitureItem.jsx에서 라벨(Html)도 자동으로 뜸
      setInteractingItem(targetItemId);

      // 2초 후 종료
      setTimeout(() => {
        setInteractingItem(null);  
      }, 2000); 

    }, demoStartDelay);


    // Clean-up (페이지 이탈 시 타이머 정리)
    return () => {
      clearTimeout(introTimer)
      clearTimeout(demoTimer)
      setIsIntroPlaying(false)
      setActiveIntroTab(null)
      setInteractingItem(null)
      setCursorLabel(null)
    }
  }, [
    setIsIntroPlaying, setActiveIntroTab, setIsCategoryOpen, 
    setInteractingItem, setCursorLabel, 
    hasIntroPlayed, setHasIntroPlayed // 의존성 배열 추가
  ])
  
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