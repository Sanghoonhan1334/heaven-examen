'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface VerseData {
  reference: string
  content: string
}

const verses: VerseData[] = [
  {
    reference: '예레미야 29:11',
    content: '나 여호와가 말하노라 너희를 향한 나의 생각은 내가 아나니 재앙이 아니라 곧 평안이요 너희 장래에 소망을 주려하는 생각이라'
  },
  {
    reference: '로마서 8:24–25',
    content: '우리가 소망으로 구원을 얻었으매 보이는 소망이 소망이 아니니 보는 것을 누가 바라리요 만일 우리가 보지 못하는 것을 바라면 참음으로 기다릴찌니라'
  },
  {
    reference: '시편 39:7',
    content: '주여 내가 무엇을 바라리요 나의 소망은 주께 있나이다'
  },
  {
    reference: '히브리서 6:19',
    content: '우리가 이 소망이 있는 것은 영혼의 닻 같아서 튼튼하고 견고하여 휘장 안에 들어 가나니'
  },
  {
    reference: '디모데후서 2:15',
    content: '네가 진리의 말씀을 옳게 분변하며 부끄러울 것이 없는 일군으로 인정된 자로 자신을 하나님 앞에 드리기를 힘쓰라'
  },
  {
    reference: '호세아 4:6',
    content: '내 백성이 지식이 없으므로 망하는도다 네가 지식을 버렸으니 나도 너를 버려 내 제사장이 되지 못하게 할 것이요 네가 네 하나님의 율법을 잊었으니 나도 네 자녀들을 잊어버리리라'
  },
  {
    reference: '시편 119:105',
    content: '주의 말씀은 내 발에 등이요 내 길에 빛이니이다'
  },
  {
    reference: '잠언 1:5',
    content: '지혜 있는 자는 듣고 학식이 더할 것이요 명철한 자는 모략을 얻을 것이라'
  },
  {
    reference: '잠언 9:10',
    content: '여호와를 경외하는 것이 지혜의 근본이요 거룩하신 자를 아는 것이 명철이니라'
  },
  {
    reference: '잠언 16:3',
    content: '너의 행사를 여호와께 맡기라 그리하면 너의 경영하는 것이 이루리라'
  },
  {
    reference: '야고보서 1:4',
    content: '인내를 온전히 이루라 이는 너희로 온전하고 구비하여 조금도 부족함이 없게 하려 함이라'
  },
  {
    reference: '히브리서 12:11',
    content: '무릇 징계가 당시에는 즐거워 보이지 않고 슬퍼 보이나 후에 그로 말미암아 연달한 자에게는 의의 평강한 열매를 맺나니'
  },
  {
    reference: '고린도전서 9:24–27',
    content: '운동장에서 달음질하는 자들이 다 달아날찌라도 오직 상 얻는 자는 하나인 줄을 너희가 알지 못하느냐 너희도 얻도록 이와 같이 달음질하라 이기기를 다투는 자마다 모든 일에 절제하나니 저희는 썩을 면류관을 얻고자 하되 우리는 썩지 아니할 것을 얻고자 하노라 그러므로 내가 달음질하기를 향방 없는것 같이 아니하고 싸우기를 허공을 치는것 같이 아니하여 내가 내 몸을 쳐 복종하게 함은 내가 남에게 전파한 후에 자기가 도리어 버림이 될까 두려워함이로라'
  },
  {
    reference: '마태복음 7:7–8',
    content: '구하라 그러면 너희에게 주실 것이요 찾으라 그러면 찾을 것이요 문을 두드리라 그러면 너희에게 열릴 것이니 구하는 이마다 얻을 것이요 찾는 이가 찾을 것이요 두드리는 이에게 열릴 것이니라'
  },
  {
    reference: '시편 37:23',
    content: '여호와께서 사람의 걸음을 정하시고 그 길을 기뻐하시나니'
  },
  {
    reference: '잠언 3:5–6',
    content: '너는 마음을 다하여 여호와를 의뢰하고 네 명철을 의지하지 말라 너는 범사에 그를 인정하라 그리하면 네 길을 지도하시리라'
  },
  {
    reference: '이사야 30:21',
    content: '너희가 우편으로 치우치든지 좌편으로 치우치든지 네 뒤에서 말 소리가 네 귀에 들려 이르기를 이것이 정로니 너희는 이리로 행하라 할 것이며'
  },
  {
    reference: '빌립보서 3:14',
    content: '푯대를 향하여 그리스도 예수 안에서 하나님이 위에서 부르신 부름의 상을 위하여 좇아가노라'
  },
  {
    reference: '히브리서 12:2',
    content: '믿음의 주요 또 온전케 하시는 이인 예수를 바라보자 저는 그 앞에 있는 즐거움을 위하여 십자가를 참으사 부끄러움을 개의치 아니하시더니 하나님 보좌 우편에 앉으셨느니라'
  },
  {
    reference: '디모데전서 4:7–8',
    content: '망령되고 허탄한 신화를 버리고 오직 경건에 이르기를 연습하라 육체의 연습은 약간의 유익이 있으나 경건은 범사에 유익하니 금생과 내생에 약속이 있느니라'
  },
  {
    reference: '시편 119:130',
    content: '주의 말씀을 열므로 우둔한 자에게 비취어 깨닫게 하나이다'
  },
  {
    reference: '잠언 2:6',
    content: '그는 정직한 자를 위하여 완전한 지혜를 예비하시며 행실이 온전한 자에게 방패가 되시나니 대저 그는 공평의 길을 보호하시며 그 성도들의 길을 보전하려 하심이니라 그런즉 네가 공의와 공평과 정직 곧 모든 선한 길을 깨달을 것이라 곧 지혜가 네 마음에 들어가며 지식이 네 영혼에 즐겁게 될 것이요'
  },
  {
    reference: '요한복음 8:31–32',
    content: '그러므로 예수께서 자기를 믿은 유대인들에게 이르시되 너희가 내 말에 거하면 참 내 제자가 되고 진리를 알찌니 진리가 너희를 자유케 하리라'
  },
  {
    reference: '시편 37:5',
    content: '너의 길을 여호와께 맡기라 저를 의지하면 저가 이루시고'
  },
  {
    reference: '시편 20:4',
    content: '네 마음의 소원대로 허락하시고 네 모든 도모를 이루시기를 원하노라'
  },
  {
    reference: '여호수아 1:8',
    content: '이 율법책을 네 입에서 떠나지 말게 하며 주야로 그것을 묵상하여 그 가운데 기록한대로 다 지켜 행하라 그리하면 네 길이 평탄하게 될 것이라 네가 형통하리라'
  },
  {
    reference: '여호수아 1:9',
    content: '내가 네게 명한 것이 아니냐 마음을 강하게 하고 담대히 하라 두려워 말며 놀라지 말라 네가 어디로 가든지 네 하나님 여호와가 너와 함께 하느니라 하시니라'
  },
  {
    reference: '잠언 4:18',
    content: '의인의 길은 돋는 햇볕 같아서 점점 빛나서 원만한 광명에 이르거니와'
  },
  {
    reference: '시편 32:8',
    content: '내가 너의 갈 길을 가르쳐 보이고 너를 주목하여 훈계하리로다'
  },
  {
    reference: '이사야 41:10',
    content: '두려워 말라 내가 너와 함께 함이니라 놀라지 말라 나는 네 하나님이 됨이니라 내가 너를 굳세게 하리라 참으로 너를 도와 주리라 참으로 나의 의로운 오른손으로 너를 붙들리라'
  },
  {
    reference: '갈라디아서 6:9',
    content: '우리가 선을 행하되 낙심하지 말찌니 피곤하지 아니하면 때가 이르매 거두리라'
  },
  {
    reference: '히브리서 10:36',
    content: '너희에게 인내가 필요함은 너희가 하나님의 뜻을 행한 후에 약속을 받기 위함이라'
  },
  {
    reference: '시편 40:8',
    content: '나의 하나님이여 내가 주의 뜻 행하기를 즐기오니 주의 법이 나의 심중에 있나이다 하였나이다'
  },
  {
    reference: '고린도후서 4:16',
    content: '그러므로 우리가 낙심하지 아니하노니 겉사람은 후패하나 우리의 속은 날로 새롭도다'
  },
  {
    reference: '베드로후서 1:5–7',
    content: '이러므로 너희가 더욱 힘써 너희 믿음에 덕을, 덕에 지식을, 지식에 절제를, 절제에 인내를, 인내에 경건을, 경건에 형제 우애를, 형제 우애에 사랑을 공급하라'
  },
  {
    reference: '에베소서 6:13',
    content: '우리의 씨름은 혈과 육에 대한 것이 아니요 정사와 권세와 이 어두움의 세상 주관자들과 하늘에 있는 악의 영들에게 대함이라 그러므로 하나님의 전신갑주를 취하라 이는 악한 날에 너희가 능히 대적하고 모든 일을 행한 후에 서기 위함이라'
  },
]

function getTodayKey(): string {
  const now = new Date()
  const koreaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  return koreaTime.toISOString().split('T')[0] // YYYY-MM-DD 형식
}

function pickRandomVerse(): VerseData {
  // 각 사용자마다 다르게 랜덤 선택 (타임스탬프 + 랜덤)
  const randomIndex = Math.floor(Math.random() * verses.length)
  return verses[randomIndex]
}

export function DailyVerse() {
  const [verse, setVerse] = useState<VerseData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasPickedToday, setHasPickedToday] = useState(false)

  useEffect(() => {
    const todayKey = getTodayKey()
    
    // localStorage에서 오늘 날짜의 성구 확인
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dailyVerse')
      if (saved) {
        try {
          const { date, verse: savedVerse } = JSON.parse(saved)
          if (date === todayKey && savedVerse) {
            // 오늘 뽑은 성구가 있으면 표시
            // savedVerse가 문자열인 경우 (이전 버전 호환) 또는 객체인 경우 처리
            if (typeof savedVerse === 'string') {
              // 이전 버전: 참조만 저장된 경우, 해당 참조로 내용 찾기
              const foundVerse = verses.find(v => v.reference === savedVerse)
              if (foundVerse) {
                setVerse(foundVerse)
                setHasPickedToday(true) // 이미 뽑았음을 표시
                return
              }
            } else if (savedVerse.reference && savedVerse.content) {
              // 새 버전: 객체로 저장된 경우
              setVerse(savedVerse)
              setHasPickedToday(true) // 이미 뽑았음을 표시
              return
            }
          }
        } catch (e) {
          console.error('Failed to parse saved verse:', e)
        }
      }
    }
    
    // 오늘 뽑지 않았으면 null로 표시 (버튼만 보임)
    setVerse(null)
    setHasPickedToday(false)
  }, [])

  const handlePickVerse = () => {
    const pickedVerse = pickRandomVerse()
    const todayKey = getTodayKey()
    
    // localStorage에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('dailyVerse', JSON.stringify({
        date: todayKey,
        verse: pickedVerse,
      }))
    }
    
    setVerse(pickedVerse)
    setHasPickedToday(true)
  }

  const handleVerseClick = () => {
    if (verse) {
      setIsModalOpen(true)
    }
  }

  return (
    <>
      {/* 모바일: 인라인 버튼 (수기 작성하기 오른쪽) - 상단용 */}
      <div className="md:hidden hidden">
        {!verse ? (
          <button
            onClick={handlePickVerse}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg rounded-full p-2 flex items-center justify-center"
            title="성구뽑기"
          >
            <span className="text-base">🎲</span>
          </button>
        ) : (
          <button
            onClick={handleVerseClick}
            className="bg-gradient-to-br from-amber-50/95 via-yellow-50/90 to-orange-50/80 border-2 border-amber-200/50 shadow-lg rounded-full px-2 py-1 text-[10px] font-semibold text-amber-900 hover:opacity-80 transition-opacity backdrop-blur-sm whitespace-nowrap"
            title="오늘의 성구"
          >
            오늘의 성구
          </button>
        )}
      </div>
      
      {/* 모바일: 하단 네비게이션 바용 */}
      <div className="md:hidden">
        {!verse ? (
          <button
            onClick={handlePickVerse}
            className="flex flex-col items-center gap-0 py-0.5 px-1 rounded-lg active:bg-gray-100 transition-colors"
            title="성구뽑기"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[8px] text-gray-600">성구</span>
          </button>
        ) : (
          <button
            onClick={handleVerseClick}
            className="flex flex-col items-center gap-0 py-0.5 px-1 rounded-lg active:bg-gray-100 transition-colors"
            title="오늘의 성구"
          >
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[8px] text-amber-600">성구</span>
          </button>
        )}
      </div>

      {/* 데스크탑: 카드 형태 */}
      <Card className="hidden md:block bg-gradient-to-br from-amber-50/90 via-yellow-50/80 to-orange-50/70 border-2 border-amber-200/50 shadow-lg backdrop-blur-sm">
        <div className="px-4 py-3 md:px-5 md:py-3">
          {!verse ? (
            // 성구를 뽑지 않았을 때: 버튼만 표시
            <div className="text-center">
              <Button
                onClick={handlePickVerse}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md w-full text-sm py-2"
              >
                <span className="text-base mr-2">🎲</span>
                성구뽑기
              </Button>
            </div>
          ) : (
            // 성구를 뽑았을 때: 성구 표시 (클릭 가능)
            <div 
              onClick={handleVerseClick}
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-600 text-base md:text-lg">📖</span>
                <h3 className="text-sm md:text-sm font-bold text-amber-900">오늘의 성구</h3>
              </div>
              <p className="text-sm md:text-base font-semibold text-amber-800 mt-2">
                {verse.reference}
              </p>
              <p className="text-xs text-amber-600 mt-1">클릭하여 내용 보기</p>
            </div>
          )}
        </div>
      </Card>

      {/* 성구 내용 모달 */}
      {verse && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-amber-50/95 via-yellow-50/90 to-orange-50/80">
            <DialogHeader>
              <DialogTitle className="text-lg md:text-3xl font-bold text-amber-900 flex items-center gap-2 md:gap-3">
                <span className="text-xl md:text-4xl">📖</span>
                오늘의 성구
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 md:mt-6 text-center">
              <p className="text-lg md:text-4xl font-bold text-amber-900 mb-4 md:mb-6">
                {verse.reference}
              </p>
              <div className="bg-white/80 rounded-lg p-4 md:p-8 backdrop-blur-sm border-2 border-amber-200/50 shadow-md">
                <p className="text-sm md:text-xl text-gray-800 leading-relaxed whitespace-pre-line">
                  {verse.content}
                </p>
              </div>
              <p className="text-xs md:text-sm text-amber-700 mt-4 md:mt-6">
                🙏 하나님의 말씀이 여러분의 하루를 인도하시길 기도합니다
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

