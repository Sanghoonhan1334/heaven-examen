export interface Essay {
  id: string
  nickname: string | null
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  q6: string
  q7: string
  created_at: string
  likes_count?: number
}

export interface Comment {
  id: string
  essay_id: string
  nickname: string | null
  content: string
  created_at: string
}

export interface EssayFormData {
  nickname?: string
  q1: string
  q2: string
  q3: string
  q4: string
  q5: string
  q6: string
  q7: string
}

