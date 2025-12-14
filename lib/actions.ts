'use server'

import { revalidatePath } from 'next/cache'
import { supabase } from './supabase'
import { Essay, EssayFormData, Comment } from '@/types/essay'

export async function getEssay(essayId: string): Promise<Essay | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured. Returning null.')
    return null
  }

  const { data, error } = await supabase
    .from('essays')
    .select('*')
    .eq('id', essayId)
    .single()

  if (error) {
    console.error('Error fetching essay:', error)
    return null
  }

  return data
}

export async function getEssays(limit?: number): Promise<Essay[]> {
  // 환경 변수 체크
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured. Returning empty array.')
    return []
  }

  let query = supabase
    .from('essays')
    .select('*')
    .order('created_at', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching essays:', error)
    // 개발 환경에서는 에러를 던지지 않고 빈 배열 반환
    if (process.env.NODE_ENV === 'development') {
      return []
    }
    throw error
  }

  // 각 essay에 대해 댓글 수 계산
  if (data) {
    const essaysWithComments = await Promise.all(
      data.map(async (essay) => {
        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('essay_id', essay.id)
        
        return {
          ...essay,
          comments_count: count || 0
        }
      })
    )
    return essaysWithComments
  }

  return []
}

export async function createEssay(formData: EssayFormData): Promise<Essay> {
  // 환경 변수 체크
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const error = new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
    console.error(error.message)
    throw error
  }

  const { data, error } = await supabase
    .from('essays')
    .insert([formData])
    .select()
    .single()

  if (error) {
    console.error('Error creating essay:', error)
    throw error
  }

  return data
}

export async function deleteEssay(essayId: string): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const error = new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in environment variables.')
    console.error('Supabase configuration error:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
    throw error
  }

  console.log('Deleting essay with ID:', essayId)
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')
  
  const { data, error } = await supabase
    .from('essays')
    .delete()
    .eq('id', essayId)
    .select()

  if (error) {
    console.error('Supabase delete error:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    })
    throw new Error(`삭제 실패: ${error.message}`)
  }

  // 삭제된 행이 있는지 확인
  if (!data || data.length === 0) {
    console.warn('No essay found with ID:', essayId, 'or already deleted')
    // 이미 삭제되었거나 존재하지 않는 경우에도 성공으로 처리
  } else {
    console.log('Successfully deleted essay:', data)
  }

  // 캐시 무효화하여 최신 데이터 가져오기
  revalidatePath('/board')
  revalidatePath('/')
  
  console.log('Cache invalidated for /board and /')
}

export async function updateEssay(essayId: string, formData: EssayFormData): Promise<Essay> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  }

  const { data, error } = await supabase
    .from('essays')
    .update(formData)
    .eq('id', essayId)
    .select()
    .single()

  if (error) {
    console.error('Error updating essay:', error)
    throw error
  }

  return data
}

// 좋아요 추가
export async function likeEssay(essayId: string): Promise<number> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured.')
  }

  // 좋아요 수 증가
  const { data: essayData } = await supabase
    .from('essays')
    .select('likes_count')
    .eq('id', essayId)
    .single()

  const currentLikes = (essayData?.likes_count || 0) as number

  const { data: updatedData, error: updateError } = await supabase
    .from('essays')
    .update({ likes_count: currentLikes + 1 })
    .eq('id', essayId)
    .select('likes_count')
    .single()

  if (updateError) {
    console.error('Error liking essay:', updateError)
    throw updateError
  }

  revalidatePath('/board')
  revalidatePath('/')
  return (updatedData?.likes_count || 0) as number
}

// 댓글 가져오기
export async function getComments(essayId: string): Promise<Comment[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase not configured. Returning empty array.')
    return []
  }

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('essay_id', essayId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  return data || []
}

// 댓글 작성
export async function createComment(essayId: string, content: string, nickname?: string): Promise<Comment> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured.')
  }

  const { data, error } = await supabase
    .from('comments')
    .insert([{ essay_id: essayId, content, nickname: nickname || null }])
    .select()
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    throw error
  }

  revalidatePath('/board')
  revalidatePath('/')
  return data
}

