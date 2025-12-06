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
import { AdminModeButton, useAdminMode } from '@/components/admin-mode'
import { deleteEssay } from '@/lib/actions'
import { useRouter } from 'next/navigation'

interface HomeClientProps {
  initialEssays: Essay[]
}

export function HomeClient({ initialEssays }: HomeClientProps) {
  const router = useRouter()
  const { isAdmin } = useAdminMode()
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [essays, setEssays] = useState<Essay[]>(initialEssays)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

  // localStorage에서 삭제된 ID 불러오기 (서버 데이터와 동기화)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deletedEssayIds')
      if (saved) {
        try {
          const ids = JSON.parse(saved)
          // 서버에서 가져온 실제 데이터에 없는 ID는 제거 (동기화)
          const serverIds = new Set(initialEssays.map(e => e.id))
          const validDeletedIds = ids.filter((id: string) => !serverIds.has(id))
          
          if (validDeletedIds.length !== ids.length) {
            // 일부 ID가 서버에 없으면 localStorage 업데이트
            if (validDeletedIds.length > 0) {
              localStorage.setItem('deletedEssayIds', JSON.stringify(validDeletedIds))
              setDeletedIds(new Set(validDeletedIds))
            } else {
              localStorage.removeItem('deletedEssayIds')
              setDeletedIds(new Set())
            }
          } else {
            setDeletedIds(new Set(ids))
          }
        } catch (e) {
          console.error('Failed to load deleted IDs:', e)
        }
      }
    }
  }, [initialEssays])

  // 삭제된 ID를 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && deletedIds.size > 0) {
      localStorage.setItem('deletedEssayIds', JSON.stringify(Array.from(deletedIds)))
    } else if (typeof window !== 'undefined' && deletedIds.size === 0) {
      localStorage.removeItem('deletedEssayIds')
    }
  }, [deletedIds])

  // initialEssays가 변경되면 업데이트 (삭제된 항목 제외)
  useEffect(() => {
    if (deletedIds.size > 0) {
      // 삭제된 항목을 제외하고 업데이트
      setEssays(initialEssays.filter(essay => !deletedIds.has(essay.id)))
    } else {
      setEssays(initialEssays)
    }
  }, [initialEssays, deletedIds])

  const handleDelete = async (essayId: string) => {
    try {
      // 실제 데이터베이스에서 삭제
      await deleteEssay(essayId)
      
      // 삭제된 ID를 추적하고 localStorage에 저장
      setDeletedIds(prev => {
        const next = new Set(prev).add(essayId)
        // localStorage에 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('deletedEssayIds', JSON.stringify(Array.from(next)))
        }
        return next
      })
      
      // 삭제된 수기를 즉시 state에서 제거
      setEssays(prev => prev.filter(essay => essay.id !== essayId))
      
      // 서버 컴포넌트를 다시 렌더링하여 최신 데이터 가져오기
      router.refresh()
    } catch (error) {
      console.error('Error deleting essay:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }
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
      <div className="container mx-auto px-4 py-4 md:py-10 pt-0 md:pt-[10vh] pb-[25vh] md:pb-[20vh]">
        {/* 오늘의 성구 - 데스크톱: 우측 상단 */}
        <div className="hidden md:block absolute top-4 md:top-6 right-4 md:right-6 z-40">
          <DailyVerse />
        </div>
        
        {/* Header */}
        <div className="text-center mb-6 md:mb-10 relative z-30 mt-8 md:mt-0">
          {/* 천국 성 이미지 */}
          <div className="relative overflow-visible" style={{ minHeight: '180px', marginBottom: '-100px', paddingTop: '20px' }}>
            <HeavenGate />
          </div>
          {/* 제목 */}
          <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent drop-shadow-lg mt-4 md:mt-[-100px]">
            천국고시 수기문
          </h1>
          <p className="text-sm md:text-lg text-gray-600 mb-3 md:mb-8 max-w-2xl mx-auto">
            천국고시 준비 과정에서 겪은 경험과 감정, 학습 방법, 동기 등을 진솔하게 기록해주세요🙏🏻
          </p>
          <div className="flex items-center justify-center gap-2 md:gap-4 relative z-50">
            <Link href="/write" className="relative z-50">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg text-xs md:text-base px-3 md:px-6 py-2 md:py-4 rounded-full relative z-50"
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
        <div className="mb-6 md:mb-8">
          <h2 className="text-base md:text-xl font-semibold text-gray-800 mb-3 md:mb-5 flex items-center gap-2">
            <span className="text-blue-500 text-sm md:text-lg">⭐</span>
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
              <div className="flex gap-3 md:gap-5 min-w-max">
                {essays.map((essay) => (
                  <div key={essay.id} className="flex-shrink-0 w-[200px] md:w-[300px]">
                    <EssayCard
                      essay={essay}
                      onClick={() => handleCardClick(essay)}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mt-6 md:mt-12 mb-4 md:mb-0">
          <Link href="/board">
            <Button variant="outline" className="border-blue-300 text-blue-700 text-xs md:text-base px-3 md:px-4 py-2 md:py-2">
              전체 보관함 보기
            </Button>
          </Link>
        </div>
      </div>

      <EssayDetailModal
        essay={selectedEssay}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onDelete={handleDelete}
      />
      <AdminModeButton />
    </HeavenLayers>
  )
}

