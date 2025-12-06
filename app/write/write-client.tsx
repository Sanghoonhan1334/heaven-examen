'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HeavenLayers } from '@/components/heaven-layers'
import { createEssay } from '@/lib/actions'
import { EssayFormData } from '@/types/essay'

const questions = [
  {
    id: 'q1',
    label: '공부를 시작하게 된 계기는 무엇인가요?',
    placeholder: '공부를 시작하게 된 특별한 계기나 동기를 자유롭게 적어주세요.',
  },
  {
    id: 'q2',
    label: '시험 준비에 얼마나 시간을 들였나요?',
    placeholder: '하루 몇 시간, 몇 개월 동안 준비하셨는지 알려주세요.',
  },
  {
    id: 'q3',
    label: '나만의 공부 비법이나 꿀팁이 있다면 무엇인가요?',
    placeholder: '다른 사람들에게 도움이 될 만한 나만의 공부 방법을 공유해주세요.',
  },
  {
    id: 'q4',
    label: '포기하고 싶을 때 어떻게 다시 마음을 다잡았나요?',
    placeholder: '어려운 순간을 극복한 경험과 방법을 들려주세요.',
  },
  {
    id: 'q5',
    label: '내년에는 어떤 마음가짐으로 공부하고 싶나요?',
    placeholder: '새해를 맞이하며 다짐하고 싶은 마음을 자유롭게 적어주세요.',
  },
]

export function WriteClient() {
  const router = useRouter()
  const [formData, setFormData] = useState<EssayFormData>({
    nickname: '',
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    q5: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createEssay(formData)
      router.push('/')
    } catch (error) {
      console.error('Error submitting essay:', error)
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      
      if (errorMessage.includes('Supabase is not configured')) {
        alert(
          '⚠️ Supabase가 설정되지 않았습니다.\n\n' +
          '수기를 저장하려면 Supabase 설정이 필요합니다:\n\n' +
          '1. Supabase 프로젝트 생성\n' +
          '2. .env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY 추가\n' +
          '3. supabase-schema.sql 파일의 SQL 실행\n' +
          '4. 서버 재시작\n\n' +
          '자세한 내용은 README.md를 참고하세요.'
        )
      } else {
        alert('수기 작성 중 오류가 발생했습니다. 다시 시도해주세요.\n\n' + errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof EssayFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // 모든 답변이 선택사항이므로 항상 제출 가능

  return (
    <HeavenLayers showStairs={false} showGate={false}>
      <div className="container mx-auto px-4 py-6 md:py-12 pt-[10vh] md:pt-[15vh] pb-[20vh] md:pb-[30vh] max-w-3xl relative z-50">
        <div className="text-center mb-4 md:mb-8 relative z-50">
          <h1 className="text-lg md:text-3xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
            ✍🏻 수기 작성하기
          </h1>
          <p className="text-xs md:text-base text-gray-600">
            여러분의 따뜻한 이야기를 들려주세요. 모든 답변은 선택사항입니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-50">
          <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-100/50 shadow-lg mb-4 md:mb-6">
            <CardHeader className="pb-2 md:pb-6">
              <CardTitle className="text-sm md:text-lg text-gray-700">닉네임 (선택사항)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 md:pt-6">
              <Textarea
                id="nickname"
                placeholder="익명으로 남기려면 비워두세요"
                value={formData.nickname || ''}
                onChange={(e) => handleChange('nickname', e.target.value)}
                className="min-h-[50px] md:min-h-[60px] text-sm md:text-base"
              />
            </CardContent>
          </Card>

          <div className="space-y-4 md:space-y-6">
            {questions.map((q, index) => (
              <Card
                key={q.id}
                className="bg-white/80 backdrop-blur-sm border-2 border-blue-100/50 shadow-md"
                style={{
                  transform: index % 2 === 0 ? 'rotate(0.5deg)' : 'rotate(-0.5deg)',
                }}
              >
                <CardHeader className="pb-2 md:pb-6">
                  <CardTitle className="text-sm md:text-lg text-gray-800 flex items-center gap-1 md:gap-2">
                    <span className="text-blue-600 text-sm md:text-base">
                      {index === 2 && '🔥'}
                      {index === 3 && '💪'}
                      {index === 4 && '⭐'}
                    </span>
                    {q.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 md:pt-6">
                  <Textarea
                    id={q.id}
                    value={formData[q.id as keyof EssayFormData] as string}
                    onChange={(e) => handleChange(q.id as keyof EssayFormData, e.target.value)}
                    placeholder={q.placeholder}
                    className="min-h-[100px] md:min-h-[120px] resize-none text-sm md:text-base"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2 md:gap-4 mt-6 md:mt-8 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-blue-300 text-blue-700 text-xs md:text-base px-3 md:px-4 py-2 md:py-2"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg px-4 md:px-8 py-2 md:py-2 text-xs md:text-base"
            >
              {isSubmitting ? '제출 중...' : '수기 제출하기 ✍🏻'}
            </Button>
          </div>
        </form>
      </div>
    </HeavenLayers>
  )
}

