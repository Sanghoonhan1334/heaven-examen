'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Essay } from '@/types/essay'
import Image from 'next/image'

interface EssayDetailModalProps {
  essay: Essay | null
  open: boolean
  onOpenChange: (open: boolean) => void
  stickerSrc?: string
}

export function EssayDetailModal({
  essay,
  open,
  onOpenChange,
  stickerSrc,
}: EssayDetailModalProps) {
  if (!essay) return null

  const questions = [
    { label: '공부를 시작하게 된 계기는 무엇인가요?', answer: essay.q1 },
    { label: '시험 준비에 얼마나 시간을 들였나요?', answer: essay.q2 },
    { label: '나만의 공부 비법이나 꿀팁이 있다면 무엇인가요?', answer: essay.q3 },
    { label: '포기하고 싶을 때 어떻게 다시 마음을 다잡았나요?', answer: essay.q4 },
    { label: '내년에는 어떤 마음가짐으로 공부하고 싶나요?', answer: essay.q5 },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-amber-50/30 to-blue-50/30">
        {stickerSrc && (
          <div className="absolute top-4 right-4 z-10 w-20 h-20">
            <Image
              src={stickerSrc}
              alt="Sticker"
              width={80}
              height={80}
              className="drop-shadow-lg"
            />
          </div>
        )}
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-blue-600">✍🏻</span>
            {essay.nickname ? `${essay.nickname}님의 수기` : '익명의 수기'}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {new Date(essay.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {questions.map((q, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-white/60 backdrop-blur-sm border border-blue-100/50 shadow-sm"
            >
              <h3 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                <span className="text-lg">
                  {index === 2 && '🔥'}
                  {index === 3 && '💪'}
                  {index === 4 && '⭐'}
                </span>
                {q.label}
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {q.answer}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

