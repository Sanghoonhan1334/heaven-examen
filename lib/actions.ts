'use server'

import { supabase } from './supabase'
import { Essay, EssayFormData } from '@/types/essay'

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

  return data || []
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
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  }

  const { error } = await supabase
    .from('essays')
    .delete()
    .eq('id', essayId)

  if (error) {
    console.error('Error deleting essay:', error)
    throw error
  }
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

