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
  student1: { left: 8, bottom: 16, width: 70 },
  student2: { left: 20, bottom: 16, width: 70 },
  student3: { left: 32, bottom: 16, width: 70 },
  student4: { left: 44, bottom: 16, width: 70 },
  pastor: { left: 60, bottom: 24, width: 80 },
  jesus: { left: 72, bottom: 32, width: 90 },
}

const defaultMobilePositions: CharacterPositions = {
  student1: { left: 5, bottom: 16, width: 50 },
  student2: { left: 25, bottom: 16, width: 50 },
  student3: { left: 45, bottom: 16, width: 50 },
  student4: { left: 65, bottom: 16, width: 50 },
  pastor: { left: 50, bottom: 40, width: 60 },
  jesus: { left: 75, bottom: 50, width: 70 },
}

const defaultTabletPositions: CharacterPositions = {
  student1: { left: 6, bottom: 16, width: 60 },
  student2: { left: 22, bottom: 16, width: 60 },
  student3: { left: 38, bottom: 16, width: 60 },
  student4: { left: 54, bottom: 16, width: 60 },
  pastor: { left: 55, bottom: 24, width: 70 },
  jesus: { left: 73, bottom: 32, width: 80 },
}

type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function BottomScene() {
  const [isLocked] = useState(true) // 항상 고정 상태
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [positions, setPositions] = useState<CharacterPositions>(defaultPositions)
  const [dragging, setDragging] = useState<keyof CharacterPositions | null>(null)
  const [resizing, setResizing] = useState<keyof CharacterPositions | null>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const resizeStartRef = useRef({ width: 0, mouseX: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const positionsRef = useRef<CharacterPositions>(defaultPositions)

  // 화면 크기 감지 (모바일/태블릿/데스크톱)
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
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

  // positions를 ref에도 동기화
  useEffect(() => {
    positionsRef.current = positions
  }, [positions])

  // 기본 위치 사용 (localStorage 무시 - 모든 환경에서 동일하게)
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

  // 위치 저장 (localStorage 저장하지 않음 - 기본값만 사용)
  const savePositions = useCallback((newPositions: CharacterPositions) => {
    // 저장하지 않고 기본값만 사용 (모든 환경에서 동일하게)
    // setPositions(newPositions)
    // positionsRef.current = newPositions
  }, [deviceType])

  // 드래그 시작
  const handleMouseDown = useCallback((e: React.MouseEvent, characterId: keyof CharacterPositions) => {
    if (isLocked) return
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return
    
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const currentPos = positionsRef.current[characterId]
    const currentLeft = (currentPos.left / 100) * rect.width
    const currentBottom = currentPos.bottom
    
    const x = e.clientX - rect.left
    const y = rect.bottom - e.clientY

    setDragging(characterId)
    dragOffsetRef.current = {
      x: x - currentLeft,
      y: y - currentBottom,
    }
  }, [isLocked])

  // 크기 조정 시작
  const handleResizeStart = useCallback((e: React.MouseEvent, characterId: keyof CharacterPositions) => {
    if (isLocked) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const currentPos = positionsRef.current[characterId]
    setResizing(characterId)
    resizeStartRef.current = {
      width: currentPos.width,
      mouseX: e.clientX,
    }
  }, [isLocked])

  // 드래그 중
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isLocked) return
    
    const container = containerRef.current
    if (!container) return

    if (resizing) {
      const deltaX = e.clientX - resizeStartRef.current.mouseX
      const scale = container.getBoundingClientRect().width / 100
      const deltaWidth = deltaX / scale
      
      const newWidth = Math.max(30, Math.min(150, resizeStartRef.current.width + deltaWidth))
      
      savePositions({
        ...positionsRef.current,
        [resizing]: {
          ...positionsRef.current[resizing],
          width: newWidth,
        },
      } as CharacterPositions)
      return
    }
    
    if (dragging) {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left - dragOffsetRef.current.x
      const y = rect.bottom - e.clientY - dragOffsetRef.current.y

      const leftPercent = (x / rect.width) * 100
      const bottomPx = y

      // 경계 체크
      const currentWidth = positionsRef.current[dragging].width
      const clampedLeft = Math.max(0, Math.min(100 - (currentWidth / rect.width * 100), leftPercent))
      const clampedBottom = Math.max(0, Math.min(rect.height, bottomPx))

      savePositions({
        ...positionsRef.current,
        [dragging]: {
          ...positionsRef.current[dragging],
          left: clampedLeft,
          bottom: clampedBottom,
        },
      })
    }
  }, [dragging, resizing, isLocked, savePositions])

  // 드래그/크기조정 종료
  const handleMouseUp = useCallback(() => {
    setDragging(null)
    setResizing(null)
  }, [])

  // 고정/해제 기능 제거됨 (위치 설정 완료)

  useEffect(() => {
    if (dragging || resizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragging, resizing, handleMouseMove, handleMouseUp])

  const renderCharacter = (
    characterId: keyof CharacterPositions,
    src: string,
    alt: string,
    defaultWidth: number,
    defaultHeight: number,
    additionalClasses?: string
  ) => {
    const pos = positions[characterId]
    const isActive = dragging === characterId || resizing === characterId
    
    return (
      <div
        key={characterId}
        className={`absolute scale-75 md:scale-100 transition-transform ${additionalClasses || ''} ${
          isActive ? 'scale-110' : ''
        }`}
        style={{
          left: `${pos.left}%`,
          bottom: `${pos.bottom}px`,
          width: `${pos.width}px`,
          cursor: isLocked ? 'default' : 'move',
          zIndex: isActive ? 40 : 20,
          pointerEvents: 'auto',
        }}
        onMouseDown={(e) => handleMouseDown(e, characterId)}
        onMouseEnter={(e) => {
          if (!isLocked) {
            e.currentTarget.style.cursor = 'move'
          }
        }}
      >
        <div className="relative w-full h-full" style={{ pointerEvents: 'auto' }}>
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
          {/* 크기 조정 핸들 */}
          {!isLocked && (
            <div
              className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-nwse-resize opacity-70 hover:opacity-100 transition-opacity z-20 border-2 border-white pointer-events-auto"
              style={{
                transform: 'translate(50%, 50%)',
              }}
              onMouseDown={(e) => handleResizeStart(e, characterId)}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      className="relative w-full overflow-hidden" 
      style={{
        // 데스크톱~태블릿 전까지는 높이 고정, 모바일에서만 반응형
        height: deviceType === 'mobile' ? '22vh' : '22vh',
        minHeight: '22vh', // 최소 높이 보장
      }}
      ref={containerRef}
    >
      {/* 언덕 배경 이미지 - 선명하게 표시 */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          height: '22vh', // 높이 고정 (데스크톱~태블릿 전까지)
          width: '100%',
        }}
      >
        <Image
          src="/bg/hill.png"
          alt="언덕"
          fill
          className="object-cover"
          style={{
            objectPosition: 'bottom center', // 좌우 중앙 정렬, 하단 고정
          }}
          priority
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
        {renderCharacter('student3', '/scene/student3.png', '학생 3', 70, 100, deviceType === 'mobile' ? '' : 'hidden sm:block')}
        {renderCharacter('student4', '/scene/student4.png', '학생 4', 70, 100, deviceType === 'mobile' ? '' : 'hidden md:block')}
        {renderCharacter('pastor', '/scene/pastor.png', '목사님', 80, 120, deviceType === 'mobile' ? '' : 'hidden sm:block')}
        {renderCharacter('jesus', '/scene/jesus.png', '예수님', 90, 130)}
      </div>
    </div>
  )
}
