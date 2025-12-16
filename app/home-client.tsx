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
import { HeartIcon, CommentIcon } from '@/components/icons'

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
  const [showScrollHint, setShowScrollHint] = useState(true)
  const [layoutMode, setLayoutMode] = useState<'horizontal' | 'vertical'>('horizontal')

  // localStorage에서 삭제된 ID 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deletedEssayIds')
      if (saved) {
        try {
          const ids = JSON.parse(saved)
          setDeletedIds(new Set(ids))
        } catch (e) {
          console.error('Failed to load deleted IDs:', e)
        }
      }
    }
  }, [])

  // 삭제된 ID를 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined' && deletedIds.size > 0) {
      localStorage.setItem('deletedEssayIds', JSON.stringify(Array.from(deletedIds)))
    } else if (typeof window !== 'undefined' && deletedIds.size === 0) {
      localStorage.removeItem('deletedEssayIds')
    }
  }, [deletedIds])

  // initialEssays가 변경되면 업데이트 (서버 데이터만 사용, localStorage는 삭제 중에만 사용)
  useEffect(() => {
    // 서버에서 가져온 데이터를 그대로 사용 (서버가 진실의 원천)
    setEssays(initialEssays)
    
    // 서버에 없는 ID는 localStorage에서 제거 (실제로 삭제된 것)
    if (deletedIds.size > 0 && typeof window !== 'undefined') {
      const serverIds = new Set(initialEssays.map(e => e.id))
      const validDeletedIds = Array.from(deletedIds).filter(id => !serverIds.has(id))
      
      // 서버에 없는 ID가 있으면 localStorage 업데이트
      if (validDeletedIds.length !== deletedIds.size) {
        if (validDeletedIds.length > 0) {
          localStorage.setItem('deletedEssayIds', JSON.stringify(validDeletedIds))
          setDeletedIds(new Set(validDeletedIds))
        } else {
          localStorage.removeItem('deletedEssayIds')
          setDeletedIds(new Set())
        }
      }
    }
  }, [initialEssays])

  const handleDelete = async (essayId: string) => {
    try {
      console.log('삭제 시작:', essayId)
      
      // 실제 데이터베이스에서 삭제
      await deleteEssay(essayId)
      
      console.log('삭제 완료:', essayId)
      
      // 삭제된 수기를 즉시 state에서 제거
      setEssays(prev => prev.filter(essay => essay.id !== essayId))
      
      // 삭제 후 충분한 딜레이를 주고 서버 컴포넌트를 다시 렌더링
      // Supabase 삭제가 완전히 반영될 시간을 줌
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 서버 컴포넌트를 다시 렌더링하여 최신 데이터 가져오기
      router.refresh()
    } catch (error) {
      console.error('Error deleting essay:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      alert(`삭제 중 오류가 발생했습니다: ${errorMessage}`)
    }
  }
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const dragStartXRef = useRef(0)
  const touchStartXRef = useRef(0)

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

  // 터치 이벤트 핸들러
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return
    touchStartXRef.current = e.touches[0].pageX
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return
    const touchX = e.touches[0].pageX
    const walk = (touchX - touchStartXRef.current) * 1.5
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk
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

  // 스크롤 위치 확인하여 힌트 표시 여부 결정 (horizontal 모드일 때만)
  useEffect(() => {
    if (layoutMode !== 'horizontal') {
      setShowScrollHint(false)
      return
    }

    const checkScroll = () => {
      if (!scrollContainerRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      // 오른쪽 끝에 도달했는지 확인 (5px 여유)
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 5
      setShowScrollHint(!isAtEnd && scrollWidth > clientWidth)
    }

    const container = scrollContainerRef.current
    if (container) {
      checkScroll()
      container.addEventListener('scroll', checkScroll)
      // 리사이즈 시에도 확인
      window.addEventListener('resize', checkScroll)
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll)
      }
      window.removeEventListener('resize', checkScroll)
    }
  }, [essays.length, layoutMode])

  return (
    <HeavenLayers>
      <div className="container mx-auto px-4 py-4 md:py-10 pt-0 md:pt-[10vh] pb-[120px] md:pb-[20vh]">
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
          <h1 className="text-4xl md:text-6xl font-bold mb-3 md:mb-4 text-blue-500 mt-4 min-[440px]:mt-8 sm:mt-12 md:mt-[-100px] [text-shadow:_-1px_-1px_0_rgba(0,0,0,0.8),_1px_-1px_0_rgba(0,0,0,0.8),_-1px_1px_0_rgba(0,0,0,0.8),_1px_1px_0_rgba(0,0,0,0.8)]">
            천국고시 수기 모음
          </h1>
          <p className="text-sm md:text-lg text-gray-600 mb-3 md:mb-8 max-w-2xl mx-auto">
            천국고시 준비 과정에서 겪은 경험과 감정, 학습 방법, 동기 등을 진솔하게 나눠주세요🙏🏻
          </p>
          {/* 데스크톱: 기존 버튼 레이아웃 */}
          <div className="hidden md:flex items-center justify-center gap-2 md:gap-4 relative z-50">
            <Link href="/write" className="relative z-50">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg text-xs md:text-base px-3 md:px-6 py-2 md:py-4 rounded-full relative z-50"
              >
                ✍🏻 수기 작성하기
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Essays Grid */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-3 md:mb-5">
            <h2 className="text-base md:text-xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-blue-500 text-sm md:text-lg">⭐</span>
              최근 작성된 수기
            </h2>
          </div>
          {initialEssays.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">아직 작성된 수기가 없습니다.</p>
              <p className="mt-2">첫 번째 수기를 작성해보세요!</p>
            </div>
          ) : layoutMode === 'horizontal' ? (
            <div className="relative -mx-4 px-4">
              <div 
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                className="overflow-x-auto overflow-y-visible pb-4 scrollbar-hide cursor-grab active:cursor-grabbing select-none" 
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                <div className="inline-flex gap-2 md:gap-5 py-2">
                  {Array.from({ length: Math.ceil(essays.length / 4) }).map((_, pageIndex) => (
                    <div key={pageIndex} className="flex-shrink-0 grid grid-cols-2 gap-2 md:gap-5 w-[300px] md:w-auto md:grid-cols-3">
                      {essays.slice(pageIndex * 4, pageIndex * 4 + 4).map((essay) => (
                        <div key={essay.id} className="w-[140px] md:w-[300px] aspect-square">
                          <EssayCard
                            essay={essay}
                            onClick={() => handleCardClick(essay)}
                            onDelete={handleDelete}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              {/* 스크롤 힌트 - 오른쪽 그라데이션과 화살표 */}
              {showScrollHint && (
                <div className="absolute right-0 top-0 bottom-4 w-20 pointer-events-none flex items-center justify-end pr-2 md:hidden">
                  {/* 그라데이션 페이드 */}
                  <div className="absolute inset-0 bg-gradient-to-l from-sky-200/30 via-sky-200/15 to-transparent" />
                  {/* 화살표 아이콘 - 애니메이션 */}
                  <div className="relative z-10 animate-scroll-hint">
                    <svg 
                      className="w-6 h-6 text-blue-500 drop-shadow-lg" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 모바일 세로 모드: 전체 화면 덮기 */}
              <div className="md:hidden fixed inset-0 z-40 overflow-y-auto pt-20 pb-24">
                <div className="px-4 py-4">
                  <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {essays.map((essay) => (
                      <div key={essay.id} className="w-full">
                        <EssayCard
                          essay={essay}
                          onClick={() => handleCardClick(essay)}
                          onDelete={handleDelete}
                          showContent={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* 데스크톱 세로 모드: 기존 레이아웃 */}
              <div className="hidden md:grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                {essays.map((essay) => (
                  <div key={essay.id} className="w-full">
                    <EssayCard
                      essay={essay}
                      onClick={() => handleCardClick(essay)}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Navigation - 데스크톱 */}
        <div className="hidden md:flex justify-center gap-4 mt-6 md:mt-12 mb-4 md:mb-0">
          <Link href="/board">
            <Button variant="outline" className="border-blue-300 text-blue-700 text-xs md:text-base px-3 md:px-4 py-2 md:py-2">
              전체 보관함 보기
            </Button>
          </Link>
          <Link href="/display">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs md:text-base px-3 md:px-4 py-2 md:py-2 shadow-lg">
              🎬 전시 모드
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
      
      {/* 모바일 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg pb-2">
        <div className="grid grid-cols-5 items-center px-2 pt-2 pb-0.5 max-w-screen-sm mx-auto">
          {/* 홈 버튼 */}
          <Link href="/" className="flex flex-col items-center gap-0 py-0.5 px-1 rounded-lg active:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[8px] text-gray-600">홈</span>
          </Link>
          
          {/* 레이아웃 전환 버튼 (햄버거 메뉴) */}
          <button
            onClick={() => setLayoutMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal')}
            className="flex flex-col items-center gap-0 py-0.5 px-1 rounded-lg active:bg-gray-100 transition-colors"
            aria-label="레이아웃 전환"
          >
            {layoutMode === 'horizontal' ? (
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4v16M12 4v16M18 4v16" />
              </svg>
            )}
            <span className="text-[8px] text-gray-600">모드</span>
          </button>
          
          {/* 수기 작성 버튼 (가운데, 큰 + 버튼) */}
          <div className="flex justify-center">
            <Link href="/write" className="flex items-center justify-center w-8 h-8 -mt-1.5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-full shadow-lg active:scale-95 transition-transform aspect-square">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
          
          {/* 전시 모드 버튼 */}
          <Link href="/display" className="flex flex-col items-center gap-0 py-0.5 px-1 rounded-lg active:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-[8px] text-gray-600">전시</span>
          </Link>
          
          {/* 오늘의 성구 버튼 - 하단 네비게이션용 */}
          <div className="flex flex-col items-center gap-0 py-0.5 px-1">
            <DailyVerse />
          </div>
        </div>
      </div>
    </HeavenLayers>
  )
}

