import { getEssays } from '@/lib/actions'
import { BoardClient } from './board-client'

export default async function BoardPage() {
  const essays = await getEssays()

  return <BoardClient initialEssays={essays} />
}

