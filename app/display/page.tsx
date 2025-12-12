import { Suspense } from 'react'
import { getEssays } from '@/lib/actions'
import { DisplayClient } from './display-client'

export default async function DisplayPage() {
  const essays = await getEssays()

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-4xl">로딩 중...</div>}>
      <DisplayClient initialEssays={essays} />
    </Suspense>
  )
}

