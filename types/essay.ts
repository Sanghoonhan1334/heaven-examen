export interface Essay {
  id: string
  nickname: string | null
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  created_at: string
}

export interface EssayFormData {
  nickname?: string
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
}

