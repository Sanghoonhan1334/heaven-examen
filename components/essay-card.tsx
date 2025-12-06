'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Essay } from '@/types/essay'
import Image from 'next/image'

interface EssayCardProps {
  essay: Essay
  stickerSrc?: string
  onClick?: () => void
  showCheckbox?: boolean
  checked?: boolean
  onCheckChange?: (checked: boolean) => void
}

export function EssayCard({
  essay,
  stickerSrc,
  onClick,
  showCheckbox = false,
  checked = false,
  onCheckChange,
}: EssayCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (showCheckbox && (e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return
    }
    onClick?.()
  }

  return (
    <Card
      className="relative cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 shadow-md bg-gradient-to-br from-white via-amber-50/30 to-blue-50/30 border-blue-100/50"
      onClick={handleClick}
    >
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
      <CardHeader className="pb-6 pt-6">
        <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          {essay.nickname ? (
            <span>
              <span className="text-blue-600 text-3xl md:text-4xl">✍🏻</span> {essay.nickname}님의 수기
            </span>
          ) : (
            <span>
              <span className="text-blue-600 text-3xl md:text-4xl">✍🏻</span> 익명의 수기
            </span>
          )}
        </CardTitle>
        <p className="text-base md:text-lg text-gray-600 font-medium">
          {new Date(essay.created_at).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </CardHeader>
    </Card>
  )
}

