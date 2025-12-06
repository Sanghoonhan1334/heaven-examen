import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EssayCard } from '@/components/essay-card'
import { EssayDetailModal } from '@/components/essay-detail-modal'
import { getEssays } from '@/lib/actions'
import { Essay } from '@/types/essay'
import { HomeClient } from './home-client'

export default async function Home() {
  const essays = await getEssays(12)

  return <HomeClient initialEssays={essays} />
}
