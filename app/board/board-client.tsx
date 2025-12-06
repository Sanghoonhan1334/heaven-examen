'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EssayCard } from '@/components/essay-card'
import { EssayDetailModal } from '@/components/essay-detail-modal'
import { HeavenLayers } from '@/components/heaven-layers'
import { HeavenGate } from '@/components/heaven-gate'
import { DailyVerse } from '@/components/daily-verse'
import { Essay } from '@/types/essay'

interface BoardClientProps {
  initialEssays: Essay[]
}

export function BoardClient({ initialEssays }: BoardClientProps) {
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [essays] = useState<Essay[]>(initialEssays)

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
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent drop-shadow-lg relative z-10">
            📚 전체 수기 보관함
          </h1>
          <p className="text-gray-600 mb-6">
            모든 수기를 한눈에 볼 수 있습니다. 전시하고 싶은 수기를 선택할 수 있습니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button variant="outline" className="border-blue-300 text-blue-700">
                홈으로
              </Button>
            </Link>
          </div>
        </div>

        {/* Selected count */}
        {selectedIds.size > 0 && (
          <div className="mb-6 text-center">
            <p className="text-blue-600 font-semibold">
              {selectedIds.size}개의 수기가 선택되었습니다
            </p>
          </div>
        )}

        {/* Essays Grid */}
        {essays.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">아직 작성된 수기가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {essays.map((essay) => (
              <EssayCard
                key={essay.id}
                essay={essay}
                onClick={() => handleCardClick(essay)}
                showCheckbox={true}
                checked={selectedIds.has(essay.id)}
                onCheckChange={(checked) => handleCheckChange(essay.id, checked)}
              />
            ))}
          </div>
        )}
      </div>

      <EssayDetailModal
        essay={selectedEssay}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </HeavenLayers>
  )
}

