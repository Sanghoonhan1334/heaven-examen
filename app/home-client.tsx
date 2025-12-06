'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EssayCard } from '@/components/essay-card'
import { EssayDetailModal } from '@/components/essay-detail-modal'
import { HeavenLayers } from '@/components/heaven-layers'
import { HeavenGate } from '@/components/heaven-gate'
import { DailyVerse } from '@/components/daily-verse'
import { Essay } from '@/types/essay'

interface HomeClientProps {
  initialEssays: Essay[]
}

export function HomeClient({ initialEssays }: HomeClientProps) {
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [essays] = useState<Essay[]>(initialEssays)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const dragStartXRef = useRef(0)

  const handleCardClick = (essay: Essay) => {
    // 드래그 중이면 클릭 무시
    if (isDraggingRef.current) {
      return
    }
    setSelectedEssay(essay)
    setIsModalOpen(true)
  }

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return
    
    isDraggingRef.current = true
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft
    dragStartXRef.current = e.pageX
    
    e.preventDefault()
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return
    
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startXRef.current) * 1.5 // 스크롤 속도 조절
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk
  }, [])

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return
    
    // 드래그 거리가 5px 미만이면 클릭으로 간주
    const dragDistance = Math.abs(e.pageX - dragStartXRef.current)
    if (dragDistance < 5) {
      isDraggingRef.current = false
    } else {
      // 드래그가 끝났음을 표시 (짧은 딜레이 후 클릭 허용)
      setTimeout(() => {
        isDraggingRef.current = false
      }, 100)
    }
  }, [])


  // 전역 마우스 이벤트 리스너
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e)
    const handleGlobalMouseUp = (e: MouseEvent) => handleMouseUp(e)
    
    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseup', handleGlobalMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <HeavenLayers>
      <div className="container mx-auto px-4 py-12 pt-[15vh] pb-[30vh]">
        {/* 오늘의 성구 - 데스크톱: 우측 상단 */}
        <div className="hidden md:block absolute top-8 right-8 z-40">
          <DailyVerse />
        </div>
        
        {/* Header */}
        <div className="text-center mb-12 relative z-30">
          {/* 천국 성 이미지 */}
          <div className="relative" style={{ minHeight: '100px', marginBottom: '-120px' }}>
            <HeavenGate />
          </div>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto mt-[-100px]">
            함께 공부하는 동료들의 따뜻한 다짐과 경험이 모인 곳입니다.
            <br />
            여러분의 이야기도 들려주세요.
          </p>
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <Link href="/write">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg text-lg px-8 py-6 rounded-full"
              >
                ✍🏻 수기 작성하기
              </Button>
            </Link>
            {/* 모바일: 성구 버튼 */}
            <div className="md:hidden">
              <DailyVerse />
            </div>
          </div>
        </div>

        {/* Recent Essays Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-blue-500">⭐</span>
            최근 작성된 수기
          </h2>
          {initialEssays.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">아직 작성된 수기가 없습니다.</p>
              <p className="mt-2">첫 번째 수기를 작성해보세요!</p>
            </div>
          ) : (
            <div 
              ref={scrollContainerRef}
              onMouseDown={handleMouseDown}
              className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide cursor-grab active:cursor-grabbing select-none" 
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              <div className="flex gap-6 min-w-max">
                {essays.map((essay) => (
                  <div key={essay.id} className="flex-shrink-0 w-[300px] md:w-[350px]">
                    <EssayCard
                      essay={essay}
                      onClick={() => handleCardClick(essay)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mt-12">
          <Link href="/board">
            <Button variant="outline" className="border-blue-300 text-blue-700">
              전체 보관함 보기
            </Button>
          </Link>
        </div>
      </div>

      <EssayDetailModal
        essay={selectedEssay}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </HeavenLayers>
  )
}

