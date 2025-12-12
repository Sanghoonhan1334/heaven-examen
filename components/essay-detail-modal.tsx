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
import { useAdminMode } from '@/components/admin-mode'
import { Button } from '@/components/ui/button'
import { deleteEssay } from '@/lib/actions'

interface EssayDetailModalProps {
  essay: Essay | null
  open: boolean
  onOpenChange: (open: boolean) => void
  stickerSrc?: string
  onDelete?: (essayId: string) => void
}

export function EssayDetailModal({
  essay,
  open,
  onOpenChange,
  stickerSrc,
  onDelete,
}: EssayDetailModalProps) {
  const { isAdmin } = useAdminMode()

  if (!essay) return null

  const handleDelete = async () => {
    if (confirm('이 수기를 삭제하시겠습니까?')) {
      try {
        await deleteEssay(essay.id)
        onDelete?.(essay.id)
        alert('수기가 삭제되었습니다.')
        onOpenChange(false)
      } catch (error) {
        alert('삭제 중 오류가 발생했습니다.')
        console.error(error)
      }
    }
  }

  const questions = [
    { label: '공부를 시작하게 된 계기는 무엇인가요?', answer: essay.q1 },
    { label: '시험 준비에 얼마나 시간을 들였나요?', answer: essay.q2 },
    { label: '나만의 공부 비법이나 꿀팁이 있다면 무엇인가요?', answer: essay.q3 },
    { label: '포기하고 싶을 때 어떻게 다시 마음을 다잡았나요?', answer: essay.q4 },
    { label: '내년에는 어떤 마음가짐으로 공부하고 싶나요?', answer: essay.q5 },
    { label: '천국고시 준비는 어떠셨나요?', answer: essay.q6 },
    { label: '응시 후 신앙의 변화가 있었다면 무엇인가요?', answer: essay.q7 },
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
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-blue-600 text-lg md:text-xl">✍🏻</span>
                {essay.nickname ? `${essay.nickname}님의 수기` : '익명의 수기'}
              </DialogTitle>
              <DialogDescription className="text-sm md:text-base text-gray-600">
                {new Date(essay.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </DialogDescription>
            </div>
            {isAdmin && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                className="ml-4"
              >
                삭제
              </Button>
            )}
          </div>
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
                  {index === 5 && '📚'}
                  {index === 6 && '✨'}
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

