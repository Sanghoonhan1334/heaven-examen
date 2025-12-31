'use client'

import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'

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
  student1: { left: 22.094997048450104, bottom: 32, width: 80.14330990817757 },
  student2: { left: 29.73281152387719, bottom: 16, width: 110.16676767542849 },
  student3: { left: 9.994138534849407, bottom: 29, width: 77.53197113692944 },
  student4: { left: 1.0862597674775005, bottom: 17, width: 71.85378489339107 },
  pastor: { left: 47.79177962642081, bottom: 0, width: 122.83219167986738 },
  jesus: { left: 59.964217182581145, bottom: 0, width: 139 },
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
  const [windowWidth, setWindowWidth] = useState(0) // 초기값은 0으로 설정하여 서버/클라이언트 일치
  const [positions, setPositions] = useState<CharacterPositions>(defaultPositions)
  const [dragging, setDragging] = useState<keyof CharacterPositions | null>(null)
  const [resizing, setResizing] = useState<keyof CharacterPositions | null>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const resizeStartRef = useRef({ width: 0, x: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const positionsRef = useRef<CharacterPositions>(defaultPositions)

  // 화면 크기 감지 (모바일/태블릿/데스크톱)
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      if (width < 640) {
        setDeviceType('mobile')
        console.log('Device type set to mobile, width:', width)
      } else if (width < 1024) {
        setDeviceType('tablet')
        console.log('Device type set to tablet, width:', width)
      } else {
        setDeviceType('desktop')
        console.log('Device type set to desktop, width:', width)
      }
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])


  // positions를 ref에도 동기화
  useEffect(() => {
    positionsRef.current = positions
  }, [positions])

  // 브라우저 콘솔에서 위치 확인할 수 있도록 window 객체에 함수 추가
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).getCharacterPositions = () => {
        return {
          deviceType,
          mobile: {
            student3: positionsRef.current.student3,
            student4: positionsRef.current.student4,
            pastor: positionsRef.current.pastor,
            jesus: positionsRef.current.jesus,
          },
          all: positionsRef.current
        }
      }
    }
  }, [deviceType])

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
    positionsRef.current = defaultPos
  }, [deviceType])

  // 드래그 시작 (모바일에서만) - 마우스
  const handleMouseDown = useCallback((e: React.MouseEvent, characterId: keyof CharacterPositions) => {
    if (deviceType !== 'mobile') {
      console.log('Not mobile, deviceType:', deviceType)
      return
    }
    // resize 핸들을 클릭한 경우는 제외
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      console.log('Resize handle clicked')
      return
    }
    
    console.log('MouseDown on character:', characterId)
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current
    if (!container) {
      console.log('No container')
      return
    }

    const rect = container.getBoundingClientRect()
    const currentPos = positionsRef.current[characterId]
    const currentLeft = (currentPos.left / 100) * rect.width
    const currentBottom = currentPos.bottom
    
    const x = e.clientX - rect.left
    const y = rect.bottom - e.clientY

    console.log('Setting dragging:', characterId)
    setDragging(characterId)
    dragOffsetRef.current = {
      x: x - currentLeft,
      y: y - currentBottom,
    }
  }, [deviceType])

  // 드래그 시작 (모바일에서만) - 터치
  const handleTouchStart = useCallback((e: React.TouchEvent, characterId: keyof CharacterPositions) => {
    if (deviceType !== 'mobile') {
      console.log('Not mobile, deviceType:', deviceType)
      return
    }
    // resize 핸들을 클릭한 경우는 제외
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      console.log('Resize handle touched')
      return
    }
    
    console.log('TouchStart on character:', characterId)
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current
    if (!container) {
      console.log('No container')
      return
    }

    const touch = e.touches[0]
    if (!touch) {
      console.log('No touch')
      return
    }
    
    const rect = container.getBoundingClientRect()
    const currentPos = positionsRef.current[characterId]
    const currentLeft = (currentPos.left / 100) * rect.width
    const currentBottom = currentPos.bottom
    
    const x = touch.clientX - rect.left
    const y = rect.bottom - touch.clientY

    console.log('Setting dragging:', characterId)
    setDragging(characterId)
    dragOffsetRef.current = {
      x: x - currentLeft,
      y: y - currentBottom,
    }
  }, [deviceType])

  // 크기 조절 시작 (모바일에서만) - 마우스
  const handleResizeStart = useCallback((e: React.MouseEvent, characterId: keyof CharacterPositions) => {
    if (deviceType !== 'mobile') return
    
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const currentPos = positionsRef.current[characterId]
    
    setResizing(characterId)
    resizeStartRef.current = {
      width: currentPos.width,
      x: e.clientX,
    }
  }, [deviceType])

  // 크기 조절 시작 (모바일에서만) - 터치
  const handleResizeStartTouch = useCallback((e: React.TouchEvent, characterId: keyof CharacterPositions) => {
    if (deviceType !== 'mobile') return
    
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return

    const touch = e.touches[0]
    const rect = container.getBoundingClientRect()
    const currentPos = positionsRef.current[characterId]
    
    setResizing(characterId)
    resizeStartRef.current = {
      width: currentPos.width,
      x: touch.clientX,
    }
  }, [deviceType])

  // 드래그 중 (모바일에서만) - 마우스
  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (deviceType !== 'mobile') return
    
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    // 크기 조절 중
    if (resizing) {
      const deltaX = clientX - resizeStartRef.current.x
      const deltaWidth = (deltaX / rect.width) * 100 * (rect.width / 100) // 픽셀 단위로 변환
      const newWidth = Math.max(50, Math.min(300, resizeStartRef.current.width + deltaWidth))
      
      setPositions({
        ...positionsRef.current,
        [resizing]: {
          ...positionsRef.current[resizing],
          width: newWidth,
        },
      })
      return
    }

    // 드래그 중
    if (dragging) {
      const x = clientX - rect.left - dragOffsetRef.current.x
      const y = rect.bottom - clientY - dragOffsetRef.current.y

      const leftPercent = (x / rect.width) * 100
      const bottomPx = y

      // 경계 체크
      const currentWidth = positionsRef.current[dragging].width
      const clampedLeft = Math.max(0, Math.min(100 - (currentWidth / rect.width * 100), leftPercent))
      const clampedBottom = Math.max(0, Math.min(rect.height, bottomPx))

      setPositions({
        ...positionsRef.current,
        [dragging]: {
          ...positionsRef.current[dragging],
          left: clampedLeft,
          bottom: clampedBottom,
        },
      })
    }
  }, [dragging, resizing, deviceType])

  // 드래그/크기 조절 종료
  const handleMouseUp = useCallback(() => {
    if (dragging || resizing) {
      // 종료 후 현재 위치/크기 출력 (모바일에서만)
      if (deviceType === 'mobile') {
        setTimeout(() => {
          console.log('=== 모바일 캐릭터 위치 (전체) ===')
          console.log(JSON.stringify({
            deviceType: 'mobile',
            student3: positionsRef.current.student3,
            student4: positionsRef.current.student4,
            pastor: positionsRef.current.pastor,
            jesus: positionsRef.current.jesus,
            all: positionsRef.current
          }, null, 2))
          console.log('========================')
        }, 100)
      }
    }
    setDragging(null)
    setResizing(null)
  }, [dragging, resizing, deviceType])

  // 이벤트 리스너
  useEffect(() => {
    if ((dragging || resizing) && deviceType === 'mobile') {
      document.addEventListener('mousemove', handleMouseMove as EventListener)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleMouseMove as EventListener, { passive: false })
      document.addEventListener('touchend', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove as EventListener)
        document.removeEventListener('mouseup', handleMouseUp)
        document.removeEventListener('touchmove', handleMouseMove as EventListener)
        document.removeEventListener('touchend', handleMouseUp)
      }
    }
  }, [dragging, resizing, deviceType, handleMouseMove, handleMouseUp])

  const renderCharacter = (
    characterId: keyof CharacterPositions,
    src: string,
    alt: string,
    defaultWidth: number,
    defaultHeight: number,
    additionalClasses?: string
  ) => {
    const pos = positions[characterId]
    // 모든 캐릭터 드래그/크기 조절 비활성화 (위치 고정)
    const isDraggable = false
    const isResizable = false
    const isActive = dragging === characterId || resizing === characterId
    const isResizing = resizing === characterId
    
    // 모든 캐릭터의 경우 클릭 가능한 영역을 넓히기 (모바일에서만)
    const needsWiderClickArea = isDraggable
    const clickAreaPadding = needsWiderClickArea ? 40 : 0 // 주변 40px 여백 추가
    
    // 목사님 캐릭터는 위로 올라갈 수 있으므로 더 높은 z-index 필요
    const isPastor = characterId === 'pastor'
    const baseZIndex = isDraggable ? (isActive ? 50 : 30) : 20
    const finalZIndex = isPastor && isDraggable ? (isActive ? 150 : 120) : baseZIndex // 목사님은 z-[100] 이상의 레이어 위에 있어야 함
    
    return (
      <div
        key={characterId}
        className={`absolute scale-75 md:scale-100 ${additionalClasses || ''} ${
          isActive ? 'scale-110' : ''
        }`}
        style={{
          left: `${pos.left}%`,
          bottom: `${pos.bottom}px`,
          width: `${pos.width}px`,
          minWidth: needsWiderClickArea ? `${pos.width + clickAreaPadding * 2}px` : undefined,
          minHeight: needsWiderClickArea ? `${pos.width * 1.2 + clickAreaPadding * 2}px` : undefined,
          padding: needsWiderClickArea ? `${clickAreaPadding}px` : '0',
          margin: needsWiderClickArea ? `-${clickAreaPadding}px` : '0',
          cursor: isDraggable ? (isActive ? 'grabbing' : 'grab') : 'default',
          zIndex: finalZIndex, // 목사님은 더 높은 z-index
          pointerEvents: isDraggable ? 'auto' : 'none',
          touchAction: isDraggable ? 'none' : 'auto', // 터치 스크롤 방지
          display: 'block', // 명시적으로 display 설정
          position: 'absolute', // 명시적으로 position 설정
        }}
        onClick={(e) => {
          if (isDraggable) {
            console.log('onClick triggered for:', characterId, 'deviceType:', deviceType)
            e.stopPropagation()
          }
        }}
        onMouseDown={isDraggable ? (e) => {
          console.log('onMouseDown triggered for:', characterId, 'deviceType:', deviceType)
          e.stopPropagation()
          e.preventDefault()
          handleMouseDown(e, characterId)
        } : undefined}
        onTouchStart={isDraggable ? (e) => {
          console.log('onTouchStart triggered for:', characterId, 'deviceType:', deviceType, 'touches:', e.touches.length)
          e.stopPropagation()
          e.preventDefault()
          handleTouchStart(e, characterId)
        } : undefined}
      >
        <Image
          src={src}
          alt={alt}
          width={defaultWidth}
          height={defaultHeight}
          className="w-full h-auto object-contain select-none"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
          draggable={false}
          unoptimized
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        {/* 크기 조절 핸들 (모바일에서만) */}
        {isResizable && (
          <div
            className="resize-handle absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full cursor-nwse-resize flex items-center justify-center shadow-lg z-50"
            style={{
              transform: 'translate(50%, 50%)',
            }}
            onMouseDown={(e) => handleResizeStart(e, characterId)}
            onTouchStart={(e) => handleResizeStartTouch(e, characterId)}
          >
            <div className="w-3 h-3 border-2 border-white rounded-full"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-visible" 
      style={{
        // 높이 제한 완전 제거 - 산이 잘리지 않도록
        minHeight: deviceType === 'mobile' ? '30vh' : deviceType === 'tablet' ? '30vh' : '40vh', // 최소 높이만 보장
        marginBottom: deviceType === 'desktop' ? '-5vh' : deviceType === 'tablet' ? '-3vh' : '-2vh', // 모든 디바이스에서 음수 마진으로 아래로 내림
      }}
    >
      {/* 언덕 배경 이미지 - 선명하게 표시 */}
      <div 
        className="absolute left-0 right-0 z-10"
        style={{
          pointerEvents: 'none',
          // 충분한 높이 확보 - transform으로 압축해도 이미지가 잘리지 않도록
          height: deviceType === 'mobile' ? '50vh' : deviceType === 'tablet' ? '60vh' : '80vh', // 충분한 높이로 원본 이미지가 잘리지 않도록
          width: '100%',
          bottom: deviceType === 'desktop' ? '-5vh' : deviceType === 'tablet' ? '-3vh' : '-2vh', // 모든 디바이스에서 음수 마진으로 아래로 내림
          transform: windowWidth > 0 && windowWidth >= 1200 ? 'scaleY(0.45)' : deviceType === 'desktop' ? 'scaleY(0.7)' : deviceType === 'tablet' ? 'scaleY(0.75)' : 'scaleY(0.8)', // 1200px 이상에서 적절하게 압축
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
      <div className="absolute inset-0 z-20" style={{ pointerEvents: deviceType === 'mobile' ? 'auto' : 'none' }}>
        {renderCharacter('student1', '/scene/student1.png', '학생 1', 70, 100)}
        {renderCharacter('student2', '/scene/student2.png', '학생 2', 70, 100)}
        {renderCharacter('student3', '/scene/student3.png', '학생 3', 70, 100)}
        {renderCharacter('student4', '/scene/student4.png', '학생 4', 70, 100)}
        {renderCharacter('pastor', '/scene/pastor.png', '목사님', 80, 120)}
        {renderCharacter('jesus', '/scene/jesus.png', '예수님', 90, 130)}
      </div>
    </div>
  )
}
