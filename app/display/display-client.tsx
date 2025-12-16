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
  const [isAnimating, setIsAnimating] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right')
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
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isMobile) {
        // 모바일: 질문 단위로 이동
        const currentQuestions = getQuestions(currentEssay)
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
        // 데스크탑: 수기 단위로 이동
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
        }
      }
      
      if (e.key === 'Escape') {
        router.push('/')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [essays, router, isMobile, currentIndex, currentQuestionIndex])

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
      // 데스크탑: 기존 로직
      const displayDuration = getDisplayDuration(currentEssay)
      const essaysLength = essays.length
      
      const interval = setInterval(() => {
        setSlideDirection('right')
        setIsAnimating(true)
        
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % essaysLength)
          setIsAnimating(false)
        }, 1000)
      }, displayDuration)

      return () => clearInterval(interval)
    }
  }, [currentIndex, currentQuestionIndex, essays.length, isMobile])

  const currentEssay = essays[currentIndex]
  const nextIndex = (currentIndex + 1) % essays.length
  const prevIndex = (currentIndex - 1 + essays.length) % essays.length
  const nextEssay = essays[nextIndex]
  const prevEssay = essays[prevIndex]

  const currentQuestions = currentEssay ? getQuestions(currentEssay) : []
  const nextQuestions = nextEssay ? getQuestions(nextEssay) : []
  const prevQuestions = prevEssay ? getQuestions(prevEssay) : []

  // 수기 변경 시 질문 인덱스 리셋
  useEffect(() => {
    setCurrentQuestionIndex(0)
  }, [currentIndex])

  // 질문 개수에 따라 동적으로 열 수 결정
  const getGridCols = (count: number) => {
    if (count <= 2) return 'grid-cols-1 md:grid-cols-2'
    if (count <= 4) return 'grid-cols-2 md:grid-cols-2'
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3'
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' // 7개 이상일 때
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
              <h3 className="text-base font-bold text-blue-700 mb-3 flex items-center gap-2 flex-shrink-0">
                <span className="text-2xl">{question.emoji}</span>
                <span className="leading-tight">{question.label}</span>
              </h3>
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap overflow-y-auto flex-1">
                {question.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
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
              {renderEssay(currentEssay, currentQuestions, true, false, false)}
              
              {/* 다음 페이지 (오른쪽으로 넘어갈 때) */}
              {slideDirection === 'right' && renderEssay(nextEssay, nextQuestions, false, true, false)}
              
              {/* 이전 페이지 (왼쪽으로 넘어갈 때) */}
              {slideDirection === 'left' && renderEssay(prevEssay, prevQuestions, false, false, true)}

              {/* 키보드 단축키 안내 (작은 글씨로) */}
              <div className="absolute bottom-4 left-4 text-xs text-gray-500 opacity-20 hover:opacity-40 transition-opacity z-[300]">
                ← → 방향키로 이동, ESC로 종료
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

