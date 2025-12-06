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
      const deletePromises = idsToDelete.map(id => deleteEssay(id))
      await Promise.all(deletePromises)
      
      // 삭제된 ID를 추적하고 localStorage에 저장
      setDeletedIds(prev => {
        const next = new Set(prev)
        idsToDelete.forEach(id => next.add(id))
        // localStorage에 저장
        if (typeof window !== 'undefined') {
          localStorage.setItem('deletedEssayIds', JSON.stringify(Array.from(next)))
        }
        return next
      })
      
      // 삭제된 수기들을 즉시 state에서 제거
      setEssays(prev => prev.filter(essay => !selectedIds.has(essay.id)))
      setSelectedIds(new Set())
      
      // 서버 컴포넌트를 다시 렌더링하여 최신 데이터 가져오기
      router.refresh()
      
      alert(`${count}개의 수기가 삭제되었습니다.`)
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDelete = async (essayId: string) => {
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
  }

  return (
    <HeavenLayers>
      <div className="container mx-auto px-4 py-12 pt-[15vh] pb-[30vh]">
        {/* 오늘의 성구 - 데스크톱: 우측 상단 */}
        <div className="hidden md:block absolute top-8 right-8 z-40">
          <DailyVerse />
        </div>
        
        {/* 모바일: 플로팅 버튼은 DailyVerse 컴포넌트 내부에서 처리 */}
        <div className="md:hidden">
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
            모든 수기를 한눈에 볼 수 있습니다. 전시하고 싶은 수기를 선택할 수 있습니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="inline-block">
              <Button variant="outline" className="border-blue-300 text-blue-700 px-6 py-3 min-w-[120px]">
                홈으로
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
    </HeavenLayers>
  )
}

