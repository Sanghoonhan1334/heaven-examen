'use client'

import Image from 'next/image'
import { useState, useEffect, useRef, useCallback } from 'react'

interface GatePosition {
  top: number
  left: number
  width: number
}

type DeviceType = 'mobile' | 'tablet' | 'desktop'

const defaultGatePositions = {
  mobile: { top: -125, left: 52.59338810810025, width: 66.55935613682092 },
  tablet: { top: -168, left: 49.97139588100686, width: 50 },
  desktop: { top: -161, left: 49.63334609225137, width: 24.510041152325307 },
}

export function HeavenGate() {
  const [isLocked] = useState(true) // 고정 상태
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  const [position, setPosition] = useState<GatePosition>(defaultGatePositions.desktop)
  const [dragging, setDragging] = useState(false)
  const [resizing, setResizing] = useState(false)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const resizeStartRef = useRef({ width: 0, mouseX: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef<GatePosition>(defaultGatePositions.desktop)

  // 화면 크기 감지
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

  // position을 ref에도 동기화
  useEffect(() => {
    positionRef.current = position
  }, [position])

  // localStorage에서 위치 불러오기 (없으면 기본값 사용)
  useEffect(() => {
    const storageKey = `heavenGatePosition${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}`
    
    const saved = localStorage.getItem(storageKey)
    
    const defaultPos = defaultGatePositions[deviceType]
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPosition(parsed)
        positionRef.current = parsed
      } catch (e) {
        console.error('Failed to load gate position:', e)
        setPosition(defaultPos)
        positionRef.current = defaultPos
      }
    } else {
      setPosition(defaultPos)
      positionRef.current = defaultPos
    }
  }, [deviceType])

  // 위치 저장
  const savePosition = useCallback((newPosition: GatePosition) => {
    setPosition(newPosition)
    positionRef.current = newPosition
    const storageKey = `heavenGatePosition${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}`
    localStorage.setItem(storageKey, JSON.stringify(newPosition))
  }, [deviceType])

  // 드래그 시작
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isLocked) return
    if ((e.target as HTMLElement).classList.contains('resize-handle')) return
    
    e.preventDefault()
    e.stopPropagation()
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const currentPos = positionRef.current
    const currentLeft = (currentPos.left / 100) * rect.width
    const currentTop = currentPos.top
    
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setDragging(true)
    dragOffsetRef.current = {
      x: x - currentLeft,
      y: y - currentTop,
    }
  }, [isLocked])

  // 크기 조정 시작
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    if (isLocked) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const currentPos = positionRef.current
    console.log('Resize start:', currentPos.width, e.clientX)
    setResizing(true)
    resizeStartRef.current = {
      width: currentPos.width,
      mouseX: e.clientX,
    }
  }, [isLocked])

  // 드래그/크기조정 중
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isLocked) return
    
    if (resizing) {
      const deltaX = e.clientX - resizeStartRef.current.mouseX
      const scale = window.innerWidth / 100
      const deltaWidth = deltaX / scale
      
      // 최소 크기만 제한, 최대 크기는 제한 없음
      const newWidth = Math.max(5, resizeStartRef.current.width + deltaWidth)
      console.log('Resizing:', { newWidth, deltaX, deltaWidth, startWidth: resizeStartRef.current.width })
      
      savePosition({
        ...positionRef.current,
        width: newWidth,
      })
      return
    }
    
    if (dragging) {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left - dragOffsetRef.current.x
      const y = e.clientY - rect.top - dragOffsetRef.current.y

      const leftPercent = (x / rect.width) * 100
      const topPx = y

      // 경계 체크 - 상단 제한을 크게 늘림
      const clampedLeft = Math.max(0, Math.min(100, leftPercent))
      const clampedTop = Math.max(-200, Math.min(100, topPx)) // -200px ~ 100px까지 가능

      savePosition({
        ...positionRef.current,
        left: clampedLeft,
        top: clampedTop,
      })
    }
  }, [dragging, resizing, isLocked, savePosition])

  // 드래그/크기조정 종료
  const handleMouseUp = useCallback(() => {
    setDragging(false)
    setResizing(false)
  }, [])

  // 고정/해제 기능 제거됨 (위치 설정 완료)

  useEffect(() => {
    const moveHandler = (e: MouseEvent) => handleMouseMove(e)
    const upHandler = () => handleMouseUp()
    
    if (dragging || resizing) {
      document.addEventListener('mousemove', moveHandler)
      document.addEventListener('mouseup', upHandler)
      return () => {
        document.removeEventListener('mousemove', moveHandler)
        document.removeEventListener('mouseup', upHandler)
      }
    }
  }, [dragging, resizing, handleMouseMove, handleMouseUp])

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* 천국문 */}
      <div
        className="relative"
        style={{
          top: `${position.top}px`,
          left: `${position.left}%`,
          width: `${position.width}vw`,
          minWidth: deviceType === 'mobile' ? '80px' : '120px', // 최소 크기만 제한
          transform: 'translateX(-50%)',
          cursor: isLocked ? 'default' : 'move',
          zIndex: dragging || resizing ? 50 : 30,
          pointerEvents: 'auto',
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={(e) => {
          if (!isLocked) {
            e.currentTarget.style.cursor = 'move'
          }
        }}
      >
        <div className="relative w-full h-full" style={{ pointerEvents: 'auto' }}>
          <Image
            src="/scene/heaven_gate.png"
            alt="천국 성"
            width={260}
            height={300}
            className="w-full h-auto object-contain drop-shadow-2xl pointer-events-none select-none"
            style={{ filter: 'drop-shadow(0 0 40px rgba(255, 215, 0, 0.6))' }}
            draggable={false}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          {/* 크기 조정 핸들 */}
          {!isLocked && (
            <div
              className="resize-handle absolute bottom-[-2px] right-[-2px] bg-blue-500 rounded-full cursor-nwse-resize opacity-90 hover:opacity-100 transition-opacity border-2 border-white shadow-lg"
              style={{
                width: '24px',
                height: '24px',
                pointerEvents: 'auto',
                zIndex: 50,
              }}
              onMouseDown={(e) => {
                console.log('Resize handle clicked!', e)
                e.preventDefault()
                e.stopPropagation()
                handleResizeStart(e)
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
