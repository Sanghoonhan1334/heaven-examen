'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Essay } from '@/types/essay'
import { HeavenLayers } from '@/components/heaven-layers'
import { DailyVerse } from '@/components/daily-verse'

interface DisplayClientProps {
  initialEssays: Essay[]
}

export function DisplayClient({ initialEssays }: DisplayClientProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0) // 모바일용: 현재 질문 인덱스
  const [currentPageIndex, setCurrentPageIndex] = useState(0) // 데스크탑용: 긴 수기의 페이지 인덱스 (0 또는 1)
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
  const [isPageTransition, setIsPageTransition] = useState(false) // 같은 수기의 페이지 전환인지 여부
  const [fadeInReady, setFadeInReady] = useState(false) // 페이드 인 시작 준비 상태
  const [isMobile, setIsMobile] = useState(false)
  const essays = initialEssays.filter(essay => {
    // 빈 답변이 없는 수기만 표시
    return essay.q1 || essay.q2 || essay.q3 || essay.q4 || essay.q5 || essay.q6 || essay.q7
  })

  // 질문 가져오기 함수
  const getQuestions = (essay: Essay) => {
    if (!essay) return []
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

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 키보드 단축키 처리
  useEffect(() => {
    const currentEssay = essays[currentIndex]
    if (!currentEssay || essays.length === 0) return
    
    // 현재 수기의 질문들을 미리 계산
    const currentQuestions = getQuestions(currentEssay)
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isMobile) {
        // 모바일: 질문 단위로 이동
        if (e.key === 'ArrowLeft') {
          if (currentQuestionIndex > 0) {
            setSlideDirection('left')
            setIsAnimating(true)
            setTimeout(() => {
              setCurrentQuestionIndex((prev) => prev - 1)
              setIsAnimating(false)
            }, 1000)
          } else {
            // 첫 번째 질문이면 이전 수기로
            setSlideDirection('left')
            setIsAnimating(true)
            setTimeout(() => {
              const prevIndex = (currentIndex - 1 + essays.length) % essays.length
              const prevQuestions = getQuestions(essays[prevIndex])
              setCurrentIndex(prevIndex)
              setCurrentQuestionIndex(prevQuestions.length - 1)
              setIsAnimating(false)
            }, 1000)
          }
        } else if (e.key === 'ArrowRight') {
          if (currentQuestionIndex < currentQuestions.length - 1) {
            setSlideDirection('right')
            setIsAnimating(true)
            setTimeout(() => {
              setCurrentQuestionIndex((prev) => prev + 1)
              setIsAnimating(false)
            }, 1000)
          } else {
            // 마지막 질문이면 다음 수기로
            setSlideDirection('right')
            setIsAnimating(true)
            setTimeout(() => {
              setCurrentIndex((prev) => (prev + 1) % essays.length)
              setCurrentQuestionIndex(0)
              setIsAnimating(false)
            }, 1000)
          }
        }
      } else {
        // 데스크탑: 수기 단위로 이동 (두 페이지로 나뉜 경우 페이지 간 이동 우선)
        if (e.key === 'ArrowLeft') {
          const shouldSplit = shouldSplitIntoPages(currentQuestions)
          if (shouldSplit && currentPageIndex === 1) {
            // 두 번째 페이지에서 첫 번째 페이지로 (페이드 효과)
            setIsPageTransition(true)
            setFadeInReady(false)
            setIsAnimating(true)
            setTimeout(() => {
              setFadeInReady(true) // 페이드 인 시작
            }, 400) // 페이드 아웃 완료 후
            setTimeout(() => {
              setCurrentPageIndex(0)
              setIsAnimating(false)
              setIsPageTransition(false)
              setFadeInReady(false)
            }, 800)
          } else {
            // 첫 번째 페이지이거나 나눌 필요 없으면 이전 수기로 (슬라이드 효과)
            setIsPageTransition(false)
            setSlideDirection('left')
            setIsAnimating(true)
            setTimeout(() => {
              const prevIndex = (currentIndex - 1 + essays.length) % essays.length
              const prevQuestions = getQuestions(essays[prevIndex])
              const prevShouldSplit = shouldSplitIntoPages(prevQuestions)
              setCurrentIndex(prevIndex)
              setCurrentPageIndex(prevShouldSplit ? 1 : 0)
              setIsAnimating(false)
            }, 1000)
          }
        } else if (e.key === 'ArrowRight') {
          const shouldSplit = shouldSplitIntoPages(currentQuestions)
          if (shouldSplit && currentPageIndex === 0) {
            // 첫 번째 페이지에서 두 번째 페이지로 (페이드 효과)
            setIsPageTransition(true)
            setFadeInReady(false)
            setIsAnimating(true)
            setTimeout(() => {
              setFadeInReady(true) // 페이드 인 시작
            }, 400) // 페이드 아웃 완료 후
            setTimeout(() => {
              setCurrentPageIndex(1)
              setIsAnimating(false)
              setIsPageTransition(false)
              setFadeInReady(false)
            }, 800)
          } else {
            // 두 번째 페이지이거나 나눌 필요 없으면 다음 수기로 (슬라이드 효과)
            setIsPageTransition(false)
            setSlideDirection('right')
            setIsAnimating(true)
            setTimeout(() => {
              setCurrentIndex((prev) => (prev + 1) % essays.length)
              setCurrentPageIndex(0)
              setIsAnimating(false)
            }, 1000)
          }
        }
      }
      
      if (e.key === 'Escape') {
        router.push('/')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [essays, router, isMobile, currentIndex, currentQuestionIndex, currentPageIndex])

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

  // 개별 질문의 길이에 따라 반응형 폰트 크기 계산 (데스크탑용)
  const getQuestionFontSize = (answerLength: number) => {
    // 각 질문의 개별 길이에 따라 폰트 크기 조정
    // 더 작은 폰트 크기 옵션 추가하여 내용이 잘리지 않도록 함
    
    if (answerLength >= 3000) {
      return {
        answer: 'text-[7px] md:text-[8px]',
        label: 'text-[9px] md:text-xs',
        emoji: 'text-sm md:text-base'
      }
    } else if (answerLength >= 2000) {
      return {
        answer: 'text-[8px] md:text-[9px]',
        label: 'text-[10px] md:text-xs',
        emoji: 'text-base md:text-lg'
      }
    } else if (answerLength >= 1500) {
      return {
        answer: 'text-[9px] md:text-[10px]',
        label: 'text-xs md:text-sm',
        emoji: 'text-lg md:text-xl'
      }
    } else if (answerLength >= 1000) {
      return {
        answer: 'text-[10px] md:text-xs',
        label: 'text-sm md:text-base',
        emoji: 'text-xl md:text-2xl'
      }
    } else if (answerLength >= 500) {
      return {
        answer: 'text-xs md:text-sm',
        label: 'text-base md:text-lg',
        emoji: 'text-xl md:text-2xl'
      }
    } else {
      return {
        answer: 'text-sm md:text-base',
        label: 'text-base md:text-xl',
        emoji: 'text-xl md:text-2xl'
      }
    }
  }

  // 모바일용 반응형 폰트 크기 계산
  const getMobileResponsiveFontSize = (answer: string) => {
    const length = answer?.length || 0
    
    if (length >= 2000) {
      return {
        answer: 'text-[10px]',
        label: 'text-xs',
        emoji: 'text-lg'
      }
    } else if (length >= 1000) {
      return {
        answer: 'text-[11px]',
        label: 'text-sm',
        emoji: 'text-xl'
      }
    } else if (length >= 500) {
      return {
        answer: 'text-xs',
        label: 'text-sm',
        emoji: 'text-xl'
      }
    } else {
      return {
        answer: 'text-sm',
        label: 'text-base',
        emoji: 'text-2xl'
      }
    }
  }

  // 글자 수에 따라 전시 시간 계산 (기본 30초, 1000자당 10초 추가, 최소 20초, 최대 90초)
  const getDisplayDuration = (essay: Essay) => {
    const length = getEssayLength(essay)
    const baseTime = 30000 // 30초
    const additionalTime = Math.floor(length / 1000) * 10000 // 1000자당 10초 추가
    const totalTime = baseTime + additionalTime
    return Math.max(20000, Math.min(90000, totalTime)) // 최소 20초, 최대 90초
  }

  // 페이지별 글자 수 계산 (2페이지로 나뉜 경우)
  const getPageLength = (questions: ReturnType<typeof getQuestions>, pageIndex: number) => {
    const shouldSplit = shouldSplitIntoPages(questions)
    if (!shouldSplit) {
      return questions.reduce((sum, q) => sum + (q.answer?.length || 0), 0)
    }
    const [page1Questions, page2Questions] = splitQuestionsIntoPages(questions)
    const pageQuestions = pageIndex === 0 ? page1Questions : page2Questions
    return pageQuestions.reduce((sum, q) => sum + (q.answer?.length || 0), 0)
  }

  // 페이지별 전시 시간 계산 (글자 수가 적으면 빠르게)
  const getPageDisplayDuration = (questions: ReturnType<typeof getQuestions>, pageIndex: number) => {
    const pageLength = getPageLength(questions, pageIndex)
    const baseTime = 20000 // 20초 (기본값을 줄임)
    const additionalTime = Math.floor(pageLength / 500) * 5000 // 500자당 5초 추가
    const totalTime = baseTime + additionalTime
    // 글자 수가 적으면 더 빠르게: 최소 10초, 최대 60초
    return Math.max(10000, Math.min(60000, totalTime))
  }

  // 글자 수에 따라 동적으로 전시 시간 조정
  useEffect(() => {
    const currentEssay = essays[currentIndex]
    if (!currentEssay) return

    // 모바일에서는 질문별로 슬라이드, 데스크탑에서는 전체 수기 슬라이드
    if (isMobile) {
      const currentQuestions = getQuestions(currentEssay)
      if (currentQuestions.length === 0) return

      // 현재 질문의 답변 길이에 따라 시간 조정
      const currentQuestion = currentQuestions[currentQuestionIndex]
      if (!currentQuestion) return

      const questionLength = currentQuestion.answer.length
      const baseTime = 15000 // 15초
      const additionalTime = Math.floor(questionLength / 100) * 1000 // 100자당 1초 추가
      const displayDuration = Math.max(10000, Math.min(30000, baseTime + additionalTime)) // 최소 10초, 최대 30초

      const interval = setInterval(() => {
        setSlideDirection('right')
        setIsAnimating(true)
        
        setTimeout(() => {
          // 다음 질문이 있으면 다음 질문으로, 없으면 다음 수기로
          if (currentQuestionIndex < currentQuestions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1)
          } else {
            setCurrentQuestionIndex(0)
            setCurrentIndex((prev) => (prev + 1) % essays.length)
          }
          setIsAnimating(false)
        }, 1000)
      }, displayDuration)

      return () => clearInterval(interval)
    } else {
      // 데스크탑: 두 페이지로 나뉜 경우 고려
      const currentQuestions = getQuestions(currentEssay)
      const shouldSplit = shouldSplitIntoPages(currentQuestions)
      const essaysLength = essays.length
      
      // 현재 페이지의 글자 수에 따라 전시 시간 계산
      const pageDisplayDuration = shouldSplit 
        ? getPageDisplayDuration(currentQuestions, currentPageIndex)
        : getDisplayDuration(currentEssay)
      
      const interval = setInterval(() => {
        if (shouldSplit && currentPageIndex === 0) {
          // 첫 번째 페이지에서 두 번째 페이지로 (페이드 효과)
          setIsPageTransition(true)
          setFadeInReady(false)
          setIsAnimating(true)
          setTimeout(() => {
            setFadeInReady(true) // 페이드 인 시작
          }, 400) // 페이드 아웃 완료 후
          setTimeout(() => {
            setCurrentPageIndex(1)
            setIsAnimating(false)
            setIsPageTransition(false)
            setFadeInReady(false)
          }, 800)
        } else {
          // 두 번째 페이지이거나 나눌 필요 없으면 다음 수기로 (슬라이드 효과)
          setIsPageTransition(false)
          setFadeInReady(false)
          setSlideDirection('right')
          setIsAnimating(true)
          setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % essaysLength)
            setCurrentPageIndex(0)
            setIsAnimating(false)
          }, 1000)
        }
      }, pageDisplayDuration)

      return () => clearInterval(interval)
    }
  }, [currentIndex, currentQuestionIndex, currentPageIndex, essays.length, isMobile])

  const currentEssay = essays[currentIndex]
  const nextIndex = (currentIndex + 1) % essays.length
  const prevIndex = (currentIndex - 1 + essays.length) % essays.length
  const nextEssay = essays[nextIndex]
  const prevEssay = essays[prevIndex]

  const currentQuestions = currentEssay ? getQuestions(currentEssay) : []
  const nextQuestions = nextEssay ? getQuestions(nextEssay) : []
  const prevQuestions = prevEssay ? getQuestions(prevEssay) : []

  // 수기 변경 시 질문 인덱스 및 페이지 인덱스 리셋
  useEffect(() => {
    setCurrentQuestionIndex(0)
    setCurrentPageIndex(0)
  }, [currentIndex])

  // 질문 개수에 따라 동적으로 열 수 결정
  const getGridCols = (count: number) => {
    if (count <= 2) return 'grid-cols-1 md:grid-cols-2'
    if (count <= 4) return 'grid-cols-2 md:grid-cols-2'
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3'
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' // 7개 이상일 때
  }

  // 수기가 두 페이지로 나뉘어야 하는지 확인 (더 적극적인 기준)
  const shouldSplitIntoPages = (questions: ReturnType<typeof getQuestions>) => {
    if (questions.length === 0) return false
    
    const totalLength = questions.reduce((sum, q) => sum + (q.answer?.length || 0), 0)
    const avgLength = totalLength / questions.length
    
    // 조건 1: 총 글자 수가 2000자 이상
    if (totalLength >= 2000) return true
    
    // 조건 2: 질문이 7개 이상이면 무조건 나누기
    if (questions.length >= 7) return true
    
    // 조건 3: 평균 질문 길이가 300자 이상이면 나누기
    if (avgLength >= 300) return true
    
    // 조건 4: 개별 질문 중 하나라도 800자 이상이면 나누기
    if (questions.some(q => (q.answer?.length || 0) >= 800)) return true
    
    return false
  }

  // 질문을 두 페이지로 나누기
  const splitQuestionsIntoPages = (questions: ReturnType<typeof getQuestions>) => {
    if (questions.length === 0) return [[], []]
    
    const midPoint = Math.ceil(questions.length / 2)
    return [
      questions.slice(0, midPoint),
      questions.slice(midPoint)
    ]
  }

  // 모바일용: 질문 하나씩 렌더링
  const renderMobileQuestion = (essay: Essay, questionIndex: number, isCurrent: boolean, isNext: boolean, isPrev: boolean) => {
    const questions = getQuestions(essay)
    if (questions.length === 0 || questionIndex >= questions.length) return null

    const question = questions[questionIndex]
    const nextQuestionIndex = questionIndex + 1
    const prevQuestionIndex = questionIndex - 1
    const hasNext = nextQuestionIndex < questions.length
    const hasPrev = prevQuestionIndex >= 0
    
    // 모바일용 반응형 폰트 크기 계산
    const fontSize = getMobileResponsiveFontSize(question.answer)

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
        return 'blur(8px)'
      }
      if ((isNext && slideDirection === 'right' && isAnimating) || 
          (isPrev && slideDirection === 'left' && isAnimating)) {
        return 'blur(0px)'
      }
      return 'blur(0px)'
    }

    return (
      <div
        key={`${essay.id}-${questionIndex}`}
        className="absolute inset-0 flex flex-col transition-all duration-1000 ease-in-out"
        style={{
          transform: getTransform(),
          opacity: getOpacity(),
          filter: getBlur(),
        }}
      >
        <div className="w-full max-w-[95vw] mx-auto flex-1 flex flex-col px-4">
          {/* 헤더 */}
          <div className="text-center mb-3 flex-shrink-0">
            <h1 className="text-xl font-bold text-blue-600 mb-1 drop-shadow-lg">
              {essay.nickname ? `${essay.nickname}님의 수기` : '익명의 수기'}
            </h1>
            <p className="text-xs text-gray-600">
              {questionIndex + 1} / {questions.length}
            </p>
          </div>

          {/* 질문 카드 */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-4 border-4 border-blue-200/50 flex-1 flex flex-col min-h-0">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-amber-50/50 border-2 border-blue-100/50 shadow-lg flex flex-col flex-1 overflow-hidden">
              <h3 className={`${fontSize.label} font-bold text-blue-700 mb-3 flex items-center gap-2 flex-shrink-0`}>
                <span className={fontSize.emoji}>{question.emoji}</span>
                <span className="leading-tight">{question.label}</span>
              </h3>
              <p className={`${fontSize.answer} text-gray-800 leading-relaxed whitespace-pre-wrap overflow-y-auto flex-1`}>
                {question.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderEssay = (essay: Essay, questions: typeof currentQuestions, isCurrent: boolean, isNext: boolean, isPrev: boolean, pageIndex: number = 0, isPageTransition: boolean = false) => {
    // 긴 수기는 두 페이지로 나누기
    const shouldSplit = shouldSplitIntoPages(questions)
    const [page1Questions, page2Questions] = shouldSplit ? splitQuestionsIntoPages(questions) : [questions, []]
    const displayQuestions = pageIndex === 0 ? page1Questions : page2Questions
    
    const getTransform = () => {
      // 같은 수기의 페이지 전환인 경우 슬라이드 효과 사용 안 함 (위치는 그대로)
      if (isPageTransition) {
        return 'translateX(0)' // 위치는 항상 그대로
      }
      
      // 애니메이션이 진행 중이 아니면
      if (!isAnimating) {
        // 현재 페이지만 보이도록
        if (isCurrent) return 'translateX(0)'
        // 다음/이전 페이지는 화면 밖으로
        return slideDirection === 'right' ? 'translateX(100%)' : 'translateX(-100%)'
      }
      // 애니메이션 진행 중 (다른 수기로 넘어갈 때)
      if (isCurrent) {
        // 현재 페이지는 슬라이드 아웃 없이 바로 사라지도록 (위치는 그대로)
        return 'translateX(0)'
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
      // 같은 수기의 페이지 전환인 경우 페이드 효과
      if (isPageTransition) {
        if (isCurrent && !isAnimating) return 1
        if (isCurrent && isAnimating) {
          // 페이드 아웃 - 즉시 시작하여 완전히 사라짐
          return 0
        }
        if ((isNext || isPrev) && isAnimating) {
          // 페이드 인 - fadeInReady가 true가 되면 나타남
          return fadeInReady ? 1 : 0
        }
        return 0
      }
      
      // 다른 수기로 넘어갈 때는 기존 로직
      if (isCurrent && !isAnimating) return 1
      if (isCurrent && isAnimating) return 0
      // 다음/이전 페이지는 애니메이션 중일 때만 보이도록
      if (isNext && slideDirection === 'right' && isAnimating) return 1
      if (isPrev && slideDirection === 'left' && isAnimating) return 1
      // 애니메이션이 끝나면 숨김
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
        key={`${essay.id}-page-${pageIndex}`}
        className={`absolute inset-0 flex flex-col ${isPageTransition ? 'transition-opacity duration-[400ms] ease-in-out' : isCurrent && isAnimating ? 'transition-opacity duration-200 ease-in-out' : 'transition-all duration-1000 ease-in-out'}`}
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
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm md:text-lg text-gray-600">
                {new Date(essay.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              {shouldSplit && (
                <span className="text-xs md:text-sm text-blue-500 font-semibold">
                  ({pageIndex + 1} / 2)
                </span>
              )}
            </div>
          </div>

          {/* 수기 내용 카드 */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-2xl p-4 md:p-6 border-4 border-blue-200/50 flex-1 flex flex-col min-h-0">
            <div className={`grid ${getGridCols(displayQuestions.length)} gap-3 md:gap-4 flex-1 overflow-hidden`}>
              {displayQuestions.map((q, index) => {
                // 두 페이지로 나눈 경우 항상 적절한 크기 사용, 나누지 않은 경우에만 반응형 적용
                const questionFontSize = shouldSplit 
                  ? {
                      answer: 'text-sm md:text-base',
                      label: 'text-base md:text-lg',
                      emoji: 'text-xl md:text-2xl'
                    }
                  : (() => {
                      // 나누지 않은 경우에도 매우 긴 질문만 작게
                      const answerLength = q.answer?.length || 0
                      if (answerLength >= 1500) {
                        return {
                          answer: 'text-xs md:text-sm',
                          label: 'text-sm md:text-base',
                          emoji: 'text-lg md:text-xl'
                        }
                      } else if (answerLength >= 800) {
                        return {
                          answer: 'text-xs md:text-base',
                          label: 'text-base md:text-lg',
                          emoji: 'text-xl md:text-2xl'
                        }
                      } else {
                        return {
                          answer: 'text-sm md:text-base',
                          label: 'text-base md:text-lg',
                          emoji: 'text-xl md:text-2xl'
                        }
                      }
                    })()
                return (
                  <div
                    key={index}
                    className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-50/80 to-amber-50/50 border-2 border-blue-100/50 shadow-lg flex flex-col min-h-0 overflow-hidden"
                  >
                    <h3 className={`${questionFontSize.label} font-bold text-blue-700 mb-2 md:mb-3 flex items-center gap-2 flex-shrink-0`}>
                      <span className={questionFontSize.emoji}>{q.emoji}</span>
                      <span className="leading-tight">{q.label}</span>
                    </h3>
                    <p className={`${questionFontSize.answer} text-gray-800 leading-relaxed whitespace-pre-wrap overflow-y-auto flex-1`}>
                      {q.answer}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 모바일: 다음/이전 질문 계산
  const getNextQuestionIndex = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      return currentQuestionIndex + 1
    }
    return 0 // 다음 수기의 첫 번째 질문
  }

  const getPrevQuestionIndex = () => {
    if (currentQuestionIndex > 0) {
      return currentQuestionIndex - 1
    }
    const prevQuestions = getQuestions(prevEssay)
    return prevQuestions.length - 1 // 이전 수기의 마지막 질문
  }

  const handleNextQuestion = () => {
    if (isMobile) {
      if (currentQuestionIndex < currentQuestions.length - 1) {
        setSlideDirection('right')
        setIsAnimating(true)
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1)
          setIsAnimating(false)
        }, 1000)
      } else {
        setSlideDirection('right')
        setIsAnimating(true)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % essays.length)
          setCurrentQuestionIndex(0)
          setIsAnimating(false)
        }, 1000)
      }
    } else {
      // 데스크톱: 같은 수기의 두 번째 페이지가 있으면 먼저 이동, 없으면 다음 수기로
      const shouldSplit = shouldSplitIntoPages(currentQuestions)
      if (shouldSplit && currentPageIndex === 0) {
        // 첫 번째 페이지에서 두 번째 페이지로 (페이드 효과)
        setIsPageTransition(true)
        setFadeInReady(false)
        setIsAnimating(true)
        setTimeout(() => {
          setFadeInReady(true) // 페이드 인 시작
        }, 400) // 페이드 아웃 완료 후
        setTimeout(() => {
          setCurrentPageIndex(1)
          setIsAnimating(false)
          setIsPageTransition(false)
          setFadeInReady(false)
        }, 800)
      } else {
        // 두 번째 페이지이거나 나눌 필요 없으면 다음 수기로 (슬라이드 효과)
        setIsPageTransition(false)
        setSlideDirection('right')
        setIsAnimating(true)
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % essays.length)
          setCurrentPageIndex(0)
          setIsAnimating(false)
        }, 1000)
      }
    }
  }

  const handlePrevQuestion = () => {
    if (isMobile) {
      if (currentQuestionIndex > 0) {
        setSlideDirection('left')
        setIsAnimating(true)
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev - 1)
          setIsAnimating(false)
        }, 1000)
      } else {
        setSlideDirection('left')
        setIsAnimating(true)
        setTimeout(() => {
          const prevIndex = (currentIndex - 1 + essays.length) % essays.length
          const prevQuestions = getQuestions(essays[prevIndex])
          setCurrentIndex(prevIndex)
          setCurrentQuestionIndex(prevQuestions.length - 1)
          setIsAnimating(false)
        }, 1000)
      }
    } else {
      // 데스크톱: 같은 수기의 첫 번째 페이지가 있으면 먼저 이동, 없으면 이전 수기로
      const shouldSplit = shouldSplitIntoPages(currentQuestions)
      if (shouldSplit && currentPageIndex === 1) {
        // 두 번째 페이지에서 첫 번째 페이지로 (페이드 효과)
        setIsPageTransition(true)
        setFadeInReady(false)
        setIsAnimating(true)
        setTimeout(() => {
          setFadeInReady(true) // 페이드 인 시작
        }, 400) // 페이드 아웃 완료 후
        setTimeout(() => {
          setCurrentPageIndex(0)
          setIsAnimating(false)
          setIsPageTransition(false)
          setFadeInReady(false)
        }, 800)
      } else {
        // 첫 번째 페이지이거나 나눌 필요 없으면 이전 수기로 (슬라이드 효과)
        setIsPageTransition(false)
        setSlideDirection('left')
        setIsAnimating(true)
        setTimeout(() => {
          const prevIndex = (currentIndex - 1 + essays.length) % essays.length
          const prevQuestions = getQuestions(essays[prevIndex])
          const prevShouldSplit = shouldSplitIntoPages(prevQuestions)
          setCurrentIndex(prevIndex)
          setCurrentPageIndex(prevShouldSplit ? 1 : 0) // 이전 수기도 나뉘어 있으면 마지막 페이지로
          setIsAnimating(false)
        }, 1000)
      }
    }
  }

  return (
    <HeavenLayers>
      <div className="container mx-auto px-4 py-6 pt-[3vh] pb-[30vh] min-h-screen relative overflow-hidden">
        <div className="relative w-full h-full z-[200]">
          {isMobile ? (
            <>
              {/* 모바일: 질문 하나씩 표시 */}
              {renderMobileQuestion(currentEssay, currentQuestionIndex, true, false, false)}
              
              {/* 다음 질문 */}
              {currentQuestionIndex < currentQuestions.length - 1 && (
                renderMobileQuestion(currentEssay, currentQuestionIndex + 1, false, true, false)
              )}
              {currentQuestionIndex === currentQuestions.length - 1 && (
                renderMobileQuestion(nextEssay, 0, false, true, false)
              )}
              
              {/* 이전 질문 */}
              {currentQuestionIndex > 0 && (
                renderMobileQuestion(currentEssay, currentQuestionIndex - 1, false, false, true)
              )}
              {currentQuestionIndex === 0 && (
                (() => {
                  const prevQuestions = getQuestions(prevEssay)
                  return renderMobileQuestion(prevEssay, prevQuestions.length - 1, false, false, true)
                })()
              )}
            </>
          ) : (
            <>
              {/* 데스크탑: 전체 수기 표시 */}
              {(() => {
                const shouldSplit = shouldSplitIntoPages(currentQuestions)
                const nextPageIndex = shouldSplit && currentPageIndex === 0 ? 1 : 0
                const prevPageIndex = shouldSplit && currentPageIndex === 1 ? 0 : (() => {
                  const prevShouldSplit = shouldSplitIntoPages(prevQuestions)
                  return prevShouldSplit ? 1 : 0
                })()
                
                return (
                  <>
                    {/* 현재 페이지 */}
                    {renderEssay(currentEssay, currentQuestions, true, false, false, currentPageIndex, isPageTransition)}
                    
                    {/* 다음 페이지 (오른쪽으로 넘어갈 때) */}
                    {isPageTransition && isAnimating && shouldSplit && currentPageIndex === 0 && (
                      renderEssay(currentEssay, currentQuestions, false, true, false, 1, true)
                    )}
                    {!isPageTransition && slideDirection === 'right' && isAnimating && (
                      shouldSplit && currentPageIndex === 0
                        ? null // 같은 수기의 페이지 전환은 위에서 처리
                        : renderEssay(nextEssay, nextQuestions, false, true, false, 0, false)
                    )}
                    
                    {/* 이전 페이지 (왼쪽으로 넘어갈 때) */}
                    {isPageTransition && isAnimating && shouldSplit && currentPageIndex === 1 && (
                      renderEssay(currentEssay, currentQuestions, false, false, true, 0, true)
                    )}
                    {!isPageTransition && slideDirection === 'left' && isAnimating && (
                      shouldSplit && currentPageIndex === 1
                        ? null // 같은 수기의 페이지 전환은 위에서 처리
                        : renderEssay(prevEssay, prevQuestions, false, false, true, prevPageIndex, false)
                    )}
                  </>
                )
              })()}

              {/* 데스크톱 네비게이션 버튼 */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-[300]">
                <button
                  onClick={handlePrevQuestion}
                  disabled={isAnimating}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-lg border-2 border-blue-200 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="이전 수기"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md shadow-lg border-2 border-blue-200">
                  <span className="text-sm text-gray-600">
                    {(() => {
                      const shouldSplit = shouldSplitIntoPages(currentQuestions)
                      if (shouldSplit) {
                        return `${currentIndex + 1}-${currentPageIndex + 1} / ${essays.length}`
                      }
                      return `${currentIndex + 1} / ${essays.length}`
                    })()}
                  </span>
                </div>
                
                <button
                  onClick={handleNextQuestion}
                  disabled={isAnimating}
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-white/90 backdrop-blur-md shadow-lg border-2 border-blue-200 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="다음 수기"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* 키보드 단축키 안내 (작은 글씨로) */}
              <div className="absolute bottom-4 left-4 text-xs text-gray-500 opacity-20 hover:opacity-40 transition-opacity z-[300]">
                ← → 방향키 또는 버튼으로 이동, ESC로 종료
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* 모바일 하단 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg pb-2">
        <div className="grid grid-cols-5 items-center px-2 pt-2 pb-0.5 max-w-screen-sm mx-auto">
          {/* 홈 버튼 */}
          <Link href="/" className="flex flex-col items-center gap-0 py-0.5 px-1 rounded-lg active:bg-gray-100 transition-colors">
            <svg className="w-[18px] h-[18px] text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[9px] text-gray-600">홈</span>
          </Link>
          
          {/* 이전 질문 버튼 */}
          <button
            onClick={handlePrevQuestion}
            className="flex flex-col items-center gap-0 py-0.5 px-1 rounded-lg active:bg-gray-100 transition-colors"
            disabled={isAnimating}
          >
            <svg className="w-[18px] h-[18px] text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-[9px] text-gray-600">이전</span>
          </button>
          
          {/* 수기 작성 버튼 (가운데, 큰 + 버튼) */}
          <div className="flex justify-center">
            <Link href="/write" className="flex flex-col items-center gap-0 py-0.5 px-1 rounded-lg active:bg-gray-100 transition-colors">
              <div className="flex items-center justify-center w-9 h-9 -mt-1.5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-full shadow-lg active:scale-95 transition-transform aspect-square">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-[9px] text-gray-600">수기작성</span>
            </Link>
          </div>
          
          {/* 다음 질문 버튼 */}
          <button
            onClick={handleNextQuestion}
            className="flex flex-col items-center gap-0 py-0.5 px-1 rounded-lg active:bg-gray-100 transition-colors"
            disabled={isAnimating}
          >
            <svg className="w-[18px] h-[18px] text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[9px] text-gray-600">다음</span>
          </button>
          
          {/* 전시 모드 버튼 */}
          <Link href="/display" className="flex flex-col items-center gap-0 py-0.5 px-1 rounded-lg active:bg-gray-100 transition-colors">
            <svg className="w-[18px] h-[18px] text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="text-[9px] text-purple-600">전시</span>
          </Link>
        </div>
      </div>
    </HeavenLayers>
  )
}

