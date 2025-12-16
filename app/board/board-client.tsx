'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

interface BoardClientProps {
  initialEssays: Essay[]
}

export function BoardClient({ initialEssays }: BoardClientProps) {
  const router = useRouter()
  const { isAdmin } = useAdminMode()
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [essays, setEssays] = useState<Essay[]>(initialEssays)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set())

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
    // localStorage의 deletedIds는 삭제 중에만 임시로 사용하고, 서버 동기화 후 제거
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

  const handleCardClick = (essay: Essay) => {
    setSelectedEssay(essay)
    setIsModalOpen(true)
  }

  const handleCheckChange = (essayId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(essayId)
      } else {
        next.delete(essayId)
      }
      return next
    })
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    
    const count = selectedIds.size
    if (!confirm(`선택한 ${count}개의 수기를 삭제하시겠습니까?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const idsToDelete = Array.from(selectedIds)
      console.log('일괄 삭제 시작:', idsToDelete)
      
      const deletePromises = idsToDelete.map(id => deleteEssay(id))
      await Promise.all(deletePromises)
      
      console.log('일괄 삭제 완료:', idsToDelete)
      
      // 삭제된 수기들을 즉시 state에서 제거
      setEssays(prev => prev.filter(essay => !selectedIds.has(essay.id)))
      setSelectedIds(new Set())
      
      // 삭제 후 충분한 딜레이를 주고 서버 컴포넌트를 다시 렌더링
      // Supabase 삭제가 완전히 반영될 시간을 줌
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 서버 컴포넌트를 다시 렌더링하여 최신 데이터 가져오기
      router.refresh()
      
      alert(`${count}개의 수기가 삭제되었습니다.`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      alert(`삭제 중 오류가 발생했습니다: ${errorMessage}`)
      console.error('Bulk delete error:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDelete = async (essayId: string) => {
    if (!confirm('이 수기를 삭제하시겠습니까?')) {
      return
    }
    
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
      
      alert('수기가 삭제되었습니다.')
    } catch (error) {
      console.error('Error deleting essay:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
      alert(`삭제 중 오류가 발생했습니다: ${errorMessage}`)
    }
  }

  return (
    <HeavenLayers>
      <div className="container mx-auto px-4 py-12 pt-[15vh] pb-[120px] md:pb-[30vh]">
        {/* 오늘의 성구 - 데스크톱: 우측 상단 */}
        <div className="hidden md:block absolute top-8 right-8 z-40">
          <DailyVerse />
        </div>
        
        {/* 모바일: 오른쪽 상단 */}
        <div className="md:hidden absolute top-4 right-4 z-40">
          <DailyVerse />
        </div>
        
        {/* Header */}
        <div className="text-center mb-8 relative z-30">
          {/* 천국 성 이미지 */}
          <div className="relative" style={{ minHeight: '100px', marginBottom: '-120px' }}>
            <HeavenGate />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent drop-shadow-lg relative z-10">
            📚 전체 수기 보관함
          </h1>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
            모든 수기를 한눈에 볼 수 있습니다.
          </p>
          <div className="flex gap-4 justify-center relative z-50">
            <Link href="/" className="inline-block relative z-50" style={{ pointerEvents: 'auto' }}>
              <Button 
                variant="outline" 
                className="border-blue-300 text-blue-700 px-6 py-3 min-w-[120px] relative z-50"
                style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
              >
                홈으로
              </Button>
            </Link>
            <Link href="/display" className="inline-block relative z-50" style={{ pointerEvents: 'auto' }}>
              <Button 
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 min-w-[120px] relative z-50 shadow-lg"
                style={{ pointerEvents: 'auto', touchAction: 'manipulation' }}
              >
                🎬 전시 모드
              </Button>
            </Link>
          </div>
        </div>

        {/* Selected count and bulk delete */}
        {selectedIds.size > 0 && (
          <div className="mb-6 text-center space-y-3">
            <p className="text-blue-600 font-semibold">
              {selectedIds.size}개의 수기가 선택되었습니다
            </p>
            {isAdmin && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="mx-auto"
              >
                {isDeleting ? '삭제 중...' : `선택한 ${selectedIds.size}개 삭제`}
              </Button>
            )}
          </div>
        )}

        {/* Essays Grid */}
        {essays.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">아직 작성된 수기가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {essays.map((essay) => (
              <EssayCard
                key={essay.id}
                essay={essay}
                onClick={() => handleCardClick(essay)}
                showCheckbox={true}
                checked={selectedIds.has(essay.id)}
                onCheckChange={(checked) => handleCheckChange(essay.id, checked)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
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
        <div className="grid grid-cols-4 items-center px-2 pt-2 pb-0.5 max-w-screen-sm mx-auto">
          {/* 홈 버튼 */}
          <Link href="/" className="flex flex-col items-center gap-0 py-0.5 px-1 rounded-lg active:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[8px] text-gray-600">홈</span>
          </Link>
          
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

