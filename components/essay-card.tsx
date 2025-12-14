'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Essay } from '@/types/essay'
import Image from 'next/image'
import { useAdminMode } from '@/components/admin-mode'
import { Button } from '@/components/ui/button'
import { deleteEssay } from '@/lib/actions'

interface EssayCardProps {
  essay: Essay
  stickerSrc?: string
  onClick?: () => void
  showCheckbox?: boolean
  checked?: boolean
  onCheckChange?: (checked: boolean) => void
  onDelete?: (essayId: string) => void
}

export function EssayCard({
  essay,
  stickerSrc,
  onClick,
  showCheckbox = false,
  checked = false,
  onCheckChange,
  onDelete,
}: EssayCardProps) {
  const { isAdmin } = useAdminMode()

  const handleClick = (e: React.MouseEvent) => {
    if (showCheckbox && (e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return
    }
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    onClick?.()
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('이 수기를 삭제하시겠습니까?')) {
      try {
        await deleteEssay(essay.id)
        onDelete?.(essay.id)
        alert('수기가 삭제되었습니다.')
      } catch (error) {
        alert('삭제 중 오류가 발생했습니다.')
        console.error(error)
      }
    }
  }

  return (
    <Card
      className="relative cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 shadow-md bg-gradient-to-br from-white via-amber-50/30 to-blue-50/30 border-blue-100/50"
      onClick={handleClick}
    >
      {/* 우수 배지 (좋아요 3개 이상) */}
      {(essay.likes_count || 0) >= 3 && (
        <div className="absolute -top-2 -left-2 z-20 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
          <span>⭐</span>
          <span>우수</span>
        </div>
      )}
      {stickerSrc && (
        <div className="absolute -top-4 -right-4 z-10 w-16 h-16">
          <Image
            src={stickerSrc}
            alt="Sticker"
            width={64}
            height={64}
            className="drop-shadow-lg"
          />
        </div>
      )}
      {showCheckbox && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              e.stopPropagation()
              onCheckChange?.(e.target.checked)
            }}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
      )}
      {isAdmin && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="text-xs px-2 py-1"
          >
            삭제
          </Button>
        </div>
      )}
      <CardHeader className="pb-3 md:pb-5 pt-3 md:pt-5">
        <CardTitle className="text-sm md:text-xl font-bold text-gray-800 mb-1 md:mb-3">
          {essay.nickname ? (
            <span>
              <span className="text-blue-600 text-base md:text-2xl">✍🏻</span> {essay.nickname}님의 수기
            </span>
          ) : (
            <span>
              <span className="text-blue-600 text-base md:text-2xl">✍🏻</span> 익명의 수기
            </span>
          )}
        </CardTitle>
        <p className="text-xs md:text-base text-gray-600 font-medium">
          {new Date(essay.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {/* 좋아요 수 표시 */}
        {(essay.likes_count || 0) > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs md:text-sm text-gray-500">
            <span>❤️</span>
            <span>{essay.likes_count}개</span>
          </div>
        )}
      </CardHeader>
    </Card>
  )
}

