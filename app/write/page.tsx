import { Suspense } from 'react'
import { WriteClient } from './write-client'

export default function WritePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">로딩 중...</div>}>
      <WriteClient />
    </Suspense>
  )
}
