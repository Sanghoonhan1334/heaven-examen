'use client'

import Image from 'next/image'
import { Cloud, CloudSmall } from './cloud'
import { BottomScene } from './bottom-scene'

interface HeavenLayersProps {
  children: React.ReactNode
  showStairs?: boolean
  showGate?: boolean
  showHeavenGate?: boolean
}

export function HeavenLayers({ children, showStairs = true, showGate = true, showHeavenGate = true }: HeavenLayersProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-amber-50/30 overflow-x-hidden overflow-y-visible">
      {/* 상단 레이어: 천국의 계단 + 열린 문 */}
      <div className="fixed top-0 left-0 right-0 h-[40vh] z-0 pointer-events-none">
        {/* 빛나는 효과 배경 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-yellow-200/40 via-amber-100/20 to-transparent rounded-full blur-3xl" style={{
          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, rgba(255, 200, 100, 0.2) 30%, transparent 70%)'
        }}></div>
        
        {/* 천국문 (기존) */}
        {showGate && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-10 w-full max-w-md h-auto">
            <div className="relative">
              <Image
                src="/bg/gate.png"
                alt="천국문"
                width={400}
                height={400}
                className="w-full h-auto drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.5))' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          </div>
        )}
        
        {/* 계단 */}
        {showStairs && (
          <div className="absolute bottom-0 left-0 right-0 h-[200px] z-5">
            <Image
              src="/bg/stairs.png"
              alt="계단"
              width={1200}
              height={200}
              className="w-full h-full object-cover object-bottom"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        )}
      </div>

      {/* 중간 레이어: 구름 + 메인 콘텐츠 */}
      <div className="relative z-[100]">
        {/* SVG 구름 레이어 */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Hero 영역 구름들 */}
          <div className="absolute top-10 left-[5%] w-[120px] md:w-[160px] animate-cloud-float">
            <Cloud opacity={0.85} />
          </div>
          <div className="absolute top-16 right-[8%] w-[140px] md:w-[180px] animate-cloud-float-delayed">
            <CloudSmall opacity={0.9} />
          </div>
          <div className="absolute top-1/2 left-[4%] w-[100px] md:w-[140px] animate-cloud-float-slow hidden sm:block">
            <Cloud opacity={0.8} />
          </div>
          <div className="absolute top-[60%] right-[6%] w-[130px] md:w-[170px] animate-cloud-float hidden md:block">
            <CloudSmall opacity={0.85} />
          </div>
          
          {/* 메인 콘텐츠 영역 구름들 */}
          <div className="absolute top-[30vh] left-[10%] w-[110px] md:w-[150px] animate-cloud-float-delayed hidden sm:block">
            <Cloud opacity={0.8} />
          </div>
          <div className="absolute top-[40vh] right-[12%] w-[125px] md:w-[165px] animate-cloud-float-slow">
            <CloudSmall opacity={0.85} />
          </div>
          <div className="absolute top-[50vh] left-[8%] w-[115px] md:w-[155px] animate-cloud-float hidden md:block">
            <Cloud opacity={0.75} />
          </div>
          <div className="absolute top-[65vh] right-[9%] w-[120px] md:w-[160px] animate-cloud-float-delayed hidden lg:block">
            <CloudSmall opacity={0.8} />
          </div>
        </div>

        {/* 기존 PNG 구름 배경 레이어 (선택적) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20vh] left-0 w-full h-[60vh] opacity-20">
            <Image
              src="/bg/cloud.png"
              alt="구름"
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="relative">
          {children}
        </div>
      </div>

      {/* 하단 레이어: 언덕 + 캐릭터 */}
      <div className="fixed bottom-0 md:bottom-0 left-0 right-0 z-[50] overflow-visible md:pb-0 pb-[70px]">
        <BottomScene />
      </div>
    </div>
  )
}

