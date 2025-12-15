'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Essay } from '@/types/essay'
import { HeavenLayers } from '@/components/heaven-layers'

interface DisplayClientProps {
  initialEssays: Essay[]
}

export function DisplayClient({ initialEssays }: DisplayClientProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  const essays = initialEssays.filter(essay => {
    // 빈 답변이 없는 수기만 표시
    return essay.q1 || essay.q2 || essay.q3 || essay.q4 || essay.q5 || essay.q6 || essay.q7
  })

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setSlideDirection('left')
        setIsAnimating(true)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev - 1 + essays.length) % essays.length)
          setIsAnimating(false)
        }, 1000)
      } else if (e.key === 'ArrowRight') {
        setSlideDirection('right')
        setIsAnimating(true)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % essays.length)
          setIsAnimating(false)
        }, 1000)
      } else if (e.key === 'Escape') {
        router.push('/board')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [essays.length, router])

  // 수기가 없으면 안내 메시지 표시
  if (essays.length === 0) {
    return (
      <HeavenLayers>
        <div className="container mx-auto px-4 py-6 pt-[10vh] pb-[30vh] min-h-screen flex items-center justify-center">
          <div className="text-center relative z-[200]">
            <h1 className="text-4xl md:text-6xl font-bold text-blue-600 mb-4">전시할 수기가 없습니다</h1>
            <p className="text-2xl md:text-3xl text-gray-600">수기를 작성해주세요</p>
          </div>
        </div>
      </HeavenLayers>
    )
  }

  // 글자 수를 계산하는 함수
  const getEssayLength = (essay: Essay) => {
    const text = [
      essay.q1, essay.q2, essay.q3, essay.q4, essay.q5, essay.q6, essay.q7
    ].filter(Boolean).join('')
    return text.length
  }

  // 글자 수에 따라 전시 시간 계산 (기본 30초, 1000자당 10초 추가, 최소 20초, 최대 90초)
  const getDisplayDuration = (essay: Essay) => {
    const length = getEssayLength(essay)
    const baseTime = 30000 // 30초
    const additionalTime = Math.floor(length / 1000) * 10000 // 1000자당 10초 추가
    const totalTime = baseTime + additionalTime
    return Math.max(20000, Math.min(90000, totalTime)) // 최소 20초, 최대 90초
  }

  // 글자 수에 따라 동적으로 전시 시간 조정
  useEffect(() => {
    const currentEssay = essays[currentIndex]
    if (!currentEssay) return

    const displayDuration = getDisplayDuration(currentEssay)
    const essaysLength = essays.length
    
    const interval = setInterval(() => {
      setSlideDirection('right')
      setIsAnimating(true)
      
      // 책 넘기 애니메이션 후 다음 수기로 이동
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % essaysLength)
        setIsAnimating(false)
      }, 1000) // 1초 책 넘기 애니메이션
    }, displayDuration)

    return () => clearInterval(interval)
  }, [currentIndex, essays.length])

  const currentEssay = essays[currentIndex]
  const nextIndex = (currentIndex + 1) % essays.length
  const prevIndex = (currentIndex - 1 + essays.length) % essays.length
  const nextEssay = essays[nextIndex]
  const prevEssay = essays[prevIndex]

  const getQuestions = (essay: Essay) => {
    return [
      { label: '공부를 시작하게 된 계기는 무엇인가요?', answer: essay.q1, emoji: '💭' },
      { label: '시험 준비에 얼마나 시간을 들였나요?', answer: essay.q2, emoji: '⏰' },
      { label: '나만의 공부 비법이나 꿀팁이 있다면 무엇인가요?', answer: essay.q3, emoji: '🔥' },
      { label: '포기하고 싶을 때 어떻게 다시 마음을 다잡았나요?', answer: essay.q4, emoji: '💪' },
      { label: '내년에는 어떤 마음가짐으로 공부하고 싶나요?', answer: essay.q5, emoji: '⭐' },
      { label: '천국고시 준비는 어떠셨나요?', answer: essay.q6, emoji: '📚' },
      { label: '응시 후 신앙의 변화가 있었다면 무엇인가요?', answer: essay.q7, emoji: '✨' },
    ].filter(q => q.answer && q.answer.trim() !== '') // 답변이 있는 질문만 표시
  }

  const currentQuestions = getQuestions(currentEssay)
  const nextQuestions = getQuestions(nextEssay)
  const prevQuestions = getQuestions(prevEssay)

  // 질문 개수에 따라 동적으로 열 수 결정
  const getGridCols = (count: number) => {
    if (count <= 2) return 'grid-cols-1 md:grid-cols-2'
    if (count <= 4) return 'grid-cols-2 md:grid-cols-2'
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3'
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' // 7개 이상일 때
  }

  const renderEssay = (essay: Essay, questions: typeof currentQuestions, isCurrent: boolean, isNext: boolean, isPrev: boolean) => {
    const getTransform = () => {
      if (!isAnimating) return 'translateX(0)'
      if (isCurrent) {
        return slideDirection === 'right' ? 'translateX(-100%)' : 'translateX(100%)'
      }
      if (isNext && slideDirection === 'right') {
        return 'translateX(0)'
      }
      if (isPrev && slideDirection === 'left') {
        return 'translateX(0)'
      }
      return slideDirection === 'right' ? 'translateX(100%)' : 'translateX(-100%)'
    }

    const getOpacity = () => {
      if (isCurrent && !isAnimating) return 1
      if (isCurrent && isAnimating) return 0
      if (isNext && slideDirection === 'right' && isAnimating) return 1
      if (isPrev && slideDirection === 'left' && isAnimating) return 1
      return 0
    }

    const getBlur = () => {
      if (isCurrent && isAnimating) {
        // 현재 페이지가 사라질 때 블러 증가
        return 'blur(8px)'
      }
      if ((isNext && slideDirection === 'right' && isAnimating) || 
          (isPrev && slideDirection === 'left' && isAnimating)) {
        // 새 페이지가 나타날 때 블러에서 선명하게
        return 'blur(0px)'
      }
      return 'blur(0px)'
    }

    return (
      <div
        key={essay.id}
        className="absolute inset-0 flex flex-col transition-all duration-1000 ease-in-out"
        style={{
          transform: getTransform(),
          opacity: getOpacity(),
          filter: getBlur(),
        }}
      >
        <div className="w-full max-w-[95vw] mx-auto flex-1 flex flex-col">
          {/* 헤더 */}
          <div className="text-center mb-2 md:mb-3 flex-shrink-0">
            <h1 className="text-2xl md:text-4xl font-bold text-blue-600 mb-1 md:mb-2 drop-shadow-lg">
              {essay.nickname ? `${essay.nickname}님의 수기` : '익명의 수기'}
            </h1>
            <p className="text-sm md:text-lg text-gray-600">
              {new Date(essay.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* 수기 내용 카드 */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-6 border-4 border-blue-200/50 flex-1 flex flex-col min-h-0">
            <div className={`grid ${getGridCols(questions.length)} gap-3 md:gap-4 flex-1 overflow-hidden`}>
              {questions.map((q, index) => (
                <div
                  key={index}
                  className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-50/80 to-amber-50/50 border-2 border-blue-100/50 shadow-lg flex flex-col min-h-0 overflow-hidden"
                >
                  <h3 className="text-base md:text-xl font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2 flex-shrink-0">
                    <span className="text-xl md:text-2xl">{q.emoji}</span>
                    <span className="leading-tight">{q.label}</span>
                  </h3>
                  <p className="text-sm md:text-lg text-gray-800 leading-relaxed whitespace-pre-wrap overflow-y-auto flex-1">
                    {q.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <HeavenLayers>
      <div className="container mx-auto px-4 py-6 pt-[3vh] pb-[30vh] min-h-screen relative overflow-hidden">
        <div className="relative w-full h-full z-[200]">
          {/* 현재 페이지 */}
          {renderEssay(currentEssay, currentQuestions, true, false, false)}
          
          {/* 다음 페이지 (오른쪽으로 넘어갈 때) */}
          {slideDirection === 'right' && renderEssay(nextEssay, nextQuestions, false, true, false)}
          
          {/* 이전 페이지 (왼쪽으로 넘어갈 때) */}
          {slideDirection === 'left' && renderEssay(prevEssay, prevQuestions, false, false, true)}

          {/* 키보드 단축키 안내 (작은 글씨로) */}
          <div className="absolute bottom-4 left-4 text-xs text-gray-500 opacity-20 hover:opacity-40 transition-opacity z-[300]">
            ← → 방향키로 이동, ESC로 종료
          </div>
        </div>
      </div>
    </HeavenLayers>
  )
}

