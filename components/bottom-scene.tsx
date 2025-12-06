'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface CharacterPosition {
  left: number
  bottom: number
  width: number
}

interface CharacterPositions {
  student1: CharacterPosition
  student2: CharacterPosition
  student3: CharacterPosition
  student4: CharacterPosition
  pastor: CharacterPosition
  jesus: CharacterPosition
}

const defaultPositions: CharacterPositions = {
  student1: { left: 47.98037317394396, bottom: 140, width: 115.42086740216442 },
  student2: { left: 39.11041606193273, bottom: 120, width: 158.84827293014814 },
  student3: { left: 33.53343328779678, bottom: 122, width: 113.55819185953617 },
  student4: { left: 26.695688628262186, bottom: 103, width: 113.13564116182597 },
  pastor: { left: 54.12320728220558, bottom: 124, width: 137.08752701398524 },
  jesus: { left: 61.88293426223665, bottom: 123, width: 163.54166666666666 },
}

const defaultMobilePositions: CharacterPositions = {
  student1: { left: 35.03205998551304, bottom: 90, width: 95.14330990817757 },
  student2: { left: 19.592951384017052, bottom: 65, width: 124.16676767542849 },
  student3: { left: 12.274644834775858, bottom: 66, width: 86.53197113692944 },
  student4: { left: 3.079416531604538, bottom: 50, width: 82.85378489339107 },
  pastor: { left: 46.720606514319165, bottom: 74, width: 111.83219167986738 },
  jesus: { left: 56.41216537303977, bottom: 64, width: 150 },
}

const defaultTabletPositions: CharacterPositions = {
  student1: { left: 43.81812000297666, bottom: 102, width: 109.95970643039969 },
  student2: { left: 30.944789393796324, bottom: 84, width: 138.54541747999107 },
  student3: { left: 22.245786781136275, bottom: 81, width: 108.63731018019958 },
  student4: { left: 12.907023126587767, bottom: 67, width: 101.58471606077761 },
  pastor: { left: 55.26646129884535, bottom: 85, width: 121.9927126145987 },
  jesus: { left: 63.414464775032265, bottom: 78, width: 159.51349486310528 },
}

type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function BottomScene() {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)
  const [positions, setPositions] = useState<CharacterPositions>(defaultPositions)

  // 화면 크기 감지 (모바일/태블릿/데스크톱)
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      if (width < 640) {
        setDeviceType('mobile')
      } else if (width < 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])


  // 위치 설정 (기본값만 사용)
  useEffect(() => {
    let defaultPos: CharacterPositions
    switch (deviceType) {
      case 'mobile':
        defaultPos = defaultMobilePositions
        break
      case 'tablet':
        defaultPos = defaultTabletPositions
        break
      default:
        defaultPos = defaultPositions
    }
    setPositions(defaultPos)
  }, [deviceType])

  const renderCharacter = (
    characterId: keyof CharacterPositions,
    src: string,
    alt: string,
    defaultWidth: number,
    defaultHeight: number,
    additionalClasses?: string
  ) => {
    const pos = positions[characterId]
    
    return (
      <div
        key={characterId}
        className={`absolute scale-75 md:scale-100 ${additionalClasses || ''}`}
        style={{
          left: `${pos.left}%`,
          bottom: `${pos.bottom}px`,
          width: `${pos.width}px`,
          zIndex: 20,
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={defaultWidth}
          height={defaultHeight}
          className="w-full h-auto object-contain pointer-events-none select-none"
          draggable={false}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
    )
  }

  return (
    <div 
      className="relative w-full overflow-visible" 
      style={{
        // 높이 제한 완전 제거 - 산이 잘리지 않도록
        minHeight: deviceType === 'mobile' ? '30vh' : deviceType === 'tablet' ? '30vh' : '40vh', // 최소 높이만 보장
        marginBottom: deviceType === 'desktop' ? '-5vh' : deviceType === 'tablet' ? '-3vh' : '-2vh', // 모든 디바이스에서 음수 마진으로 아래로 내림
      }}
    >
      {/* 언덕 배경 이미지 - 선명하게 표시 */}
      <div 
        className="absolute left-0 right-0 pointer-events-none z-10"
        style={{
          // 충분한 높이 확보 - transform으로 압축해도 이미지가 잘리지 않도록
          height: deviceType === 'mobile' ? '50vh' : deviceType === 'tablet' ? '60vh' : '80vh', // 충분한 높이로 원본 이미지가 잘리지 않도록
          width: '100%',
          bottom: deviceType === 'desktop' ? '-5vh' : deviceType === 'tablet' ? '-3vh' : '-2vh', // 모든 디바이스에서 음수 마진으로 아래로 내림
          transform: (typeof window !== 'undefined' && window.innerWidth >= 1200) ? 'scaleY(0.45)' : deviceType === 'desktop' ? 'scaleY(0.7)' : deviceType === 'tablet' ? 'scaleY(0.75)' : 'scaleY(0.8)', // 1200px 이상에서 적절하게 압축
          transformOrigin: 'bottom center', // 하단 기준으로 변환
        }}
      >
        <Image
          src="/bg/hill.png?v=2"
          alt="언덕"
          fill
          className="object-cover"
          style={{
            objectPosition: 'bottom center', // 하단 정렬로 산이 보이도록
            filter: 'brightness(0.8) contrast(1.4) saturate(1.5)', // 색상을 더 진하고 선명하게
          }}
          priority
          unoptimized
          onError={(e) => {
            const fallback = e.currentTarget.parentElement?.nextElementSibling as HTMLElement
            if (fallback) {
              fallback.style.display = 'block'
            }
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
      
      {/* Fallback 그라데이션 언덕 (이미지가 없을 때만 표시) */}
      <div className="absolute inset-0 bg-gradient-to-t from-green-200 via-green-100 to-transparent rounded-t-[50%] hidden pointer-events-none"></div>

      {/* 캐릭터들 */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {renderCharacter('student1', '/scene/student1.png', '학생 1', 70, 100)}
        {renderCharacter('student2', '/scene/student2.png', '학생 2', 70, 100)}
        {renderCharacter('student3', '/scene/student3.png', '학생 3', 70, 100, deviceType === 'mobile' ? '' : 'block')}
        {renderCharacter('student4', '/scene/student4.png', '학생 4', 70, 100, deviceType === 'mobile' ? '' : 'block')}
        {renderCharacter('pastor', '/scene/pastor.png', '목사님', 80, 120, deviceType === 'mobile' ? '' : 'block')}
        {renderCharacter('jesus', '/scene/jesus.png', '예수님', 90, 130)}
      </div>
    </div>
  )
}
