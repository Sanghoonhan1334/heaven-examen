'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface GatePosition {
  top: number
  left: number
  width: number
}

type DeviceType = 'mobile' | 'tablet' | 'desktop'

const defaultGatePositions = {
  mobile: { top: -32, left: 51.76616819873671, width: 80.99576951566523 },
  tablet: { top: -64, left: 50.1358695652174, width: 50 },
  desktop: { top: -104, left: 49.93576544709008, width: 33.29435487781551 },
}

export function HeavenGate() {
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null)
  const [position, setPosition] = useState<GatePosition | null>(null)
  const [mounted, setMounted] = useState(false)

  // 클라이언트 사이드에서만 마운트
  useEffect(() => {
    setMounted(true)
  }, [])

  // 화면 크기 감지
  useEffect(() => {
    if (!mounted) return

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
  }, [mounted])

  // 위치 설정 (기본값만 사용)
  useEffect(() => {
    if (deviceType) {
      const defaultPos = defaultGatePositions[deviceType]
      setPosition(defaultPos)
    }
  }, [deviceType])

  // 서버 사이드 렌더링 시 기본값 사용
  if (!mounted || !deviceType || !position) {
    return (
      <div className="relative w-full">
        <div
          className="relative"
          style={{
            top: `${defaultGatePositions.desktop.top}px`,
            left: `${defaultGatePositions.desktop.left}%`,
            width: `${defaultGatePositions.desktop.width}vw`,
            minWidth: '120px',
            transform: 'translateX(-50%)',
            zIndex: 30,
          }}
        >
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
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {/* 천국문 */}
      <div
        className="relative"
        style={{
          top: `${position.top}px`,
          left: `${position.left}%`,
          width: `${position.width}vw`,
          minWidth: deviceType === 'mobile' ? '80px' : '120px',
          transform: 'translateX(-50%)',
          zIndex: deviceType === 'mobile' ? 100 : 30,
        }}
      >
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
      </div>
    </div>
  )
}
