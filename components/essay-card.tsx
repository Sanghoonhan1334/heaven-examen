'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Essay } from '@/types/essay'
import Image from 'next/image'
import { useAdminMode } from '@/components/admin-mode'
import { Button } from '@/components/ui/button'
import { deleteEssay } from '@/lib/actions'
import { HeartIcon, CommentIcon } from '@/components/icons'

interface EssayCardProps {
  essay: Essay
  stickerSrc?: string
  onClick?: () => void
  showCheckbox?: boolean
  checked?: boolean
  onCheckChange?: (checked: boolean) => void
  onDelete?: (essayId: string) => void
  showContent?: boolean
}

export function EssayCard({
  essay,
  stickerSrc,
  onClick,
  showCheckbox = false,
  checked = false,
  onCheckChange,
  onDelete,
  showContent = false,
}: EssayCardProps) {
  const { isAdmin } = useAdminMode()
  
  // q7 (응시 후 신앙의 변화) 답변만 표시
  const [isExpanded, setIsExpanded] = useState(false)
  const answer = showContent ? (essay.q7 && essay.q7.trim() !== '' ? essay.q7 : null) : null
  const maxLength = 80 // 최대 표시 길이
  const shouldTruncate = answer && answer.length > maxLength
  const displayText = answer && shouldTruncate && !isExpanded 
    ? answer.substring(0, maxLength) + '...'
    : answer

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
      className={`relative cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 shadow-md border-blue-100/50 h-full flex flex-col ${
        showContent 
          ? 'bg-gradient-to-br from-white/95 via-amber-50/80 to-blue-50/80' 
          : 'bg-gradient-to-br from-white via-amber-50/30 to-blue-50/30'
      }`}
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
            unoptimized
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
      <CardHeader className="pb-2 md:pb-5 pt-2 md:pt-5 px-2 md:px-6 flex-1 flex flex-col justify-between">
        <CardTitle className="text-xs md:text-xl font-bold text-gray-800 mb-1 md:mb-3 leading-tight">
          {essay.nickname ? (
            <span>
              <span className="text-blue-600 text-sm md:text-2xl">✍🏻</span> <span className="text-xs md:text-xl">{essay.nickname}님의 수기</span>
            </span>
          ) : (
            <span>
              <span className="text-blue-600 text-sm md:text-2xl">✍🏻</span> <span className="text-xs md:text-xl">익명의 수기</span>
            </span>
          )}
        </CardTitle>
        <p className="hidden md:block text-xs md:text-base text-gray-600 font-medium">
          {new Date(essay.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        {/* 좋아요 및 댓글 수 표시 */}
        <div className="flex items-center gap-2 md:gap-3 mt-1 md:mt-2 text-[10px] md:text-sm text-gray-600">
          <div className="flex items-center gap-0.5 md:gap-1">
            <HeartIcon filled={(essay.likes_count || 0) > 0} className={`w-3.5 h-3.5 md:w-5 md:h-5 ${(essay.likes_count || 0) > 0 ? 'text-red-500' : 'text-gray-400'}`} />
            <span>{essay.likes_count || 0}</span>
          </div>
          <div className="flex items-center gap-0.5 md:gap-1">
            <CommentIcon className="w-3.5 h-3.5 md:w-5 md:h-5 text-blue-500" />
            <span>{essay.comments_count || 0}</span>
          </div>
        </div>
      </CardHeader>
      
      {/* 세로 모드에서 내용 표시 */}
      {showContent && displayText && (
        <CardContent className="px-2 md:px-6 pb-2 md:pb-5 pt-0">
          <p className="text-[10px] text-gray-700 leading-relaxed font-bold">
            {displayText}
          </p>
          {shouldTruncate && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="text-[9px] text-blue-600 mt-1 hover:underline"
            >
              {isExpanded ? '접기' : '더보기'}
            </button>
          )}
        </CardContent>
      )}
    </Card>
  )
}

