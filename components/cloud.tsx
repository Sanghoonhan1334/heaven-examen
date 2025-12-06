'use client'

interface CloudProps {
  className?: string
  opacity?: number
}

export function Cloud({ className = '', opacity = 0.6 }: CloudProps) {
  return (
    <svg
      viewBox="0 0 200 120"
      className={className}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 구름 실루엣 */}
      <path
        d="M50 80 Q30 60 20 70 T10 90 Q10 100 20 100 T40 95 Q50 100 60 95 T80 100 Q90 100 100 95 T120 100 Q130 100 140 95 T160 100 Q170 100 180 90 T190 70 Q180 60 160 70 T140 60 Q130 50 120 55 T100 50 Q90 45 80 50 T60 45 Q50 40 40 50 T20 45 Q10 50 20 60 Z"
        fill="white"
        fillOpacity="1"
      />
      <ellipse cx="60" cy="70" rx="25" ry="20" fill="white" fillOpacity="1" />
      <ellipse cx="100" cy="75" rx="30" ry="25" fill="white" fillOpacity="1" />
      <ellipse cx="140" cy="70" rx="25" ry="20" fill="white" fillOpacity="1" />
    </svg>
  )
}

export function CloudSmall({ className = '', opacity = 0.6 }: CloudProps) {
  return (
    <svg
      viewBox="0 0 150 90"
      className={className}
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40 60 Q25 45 15 52 T8 68 Q8 75 15 75 T30 72 Q38 75 45 72 T60 75 Q68 75 75 72 T90 75 Q95 75 100 68 T105 52 Q95 45 80 52 T60 45 Q50 38 45 42 T30 38 Q20 42 25 50 Z"
        fill="white"
        fillOpacity="1"
      />
      <ellipse cx="45" cy="52" rx="18" ry="15" fill="white" fillOpacity="1" />
      <ellipse cx="75" cy="56" rx="22" ry="18" fill="white" fillOpacity="1" />
    </svg>
  )
}

