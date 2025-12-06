import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 환경 변수가 없을 때는 더미 클라이언트 생성 (개발 환경용)
let supabase: SupabaseClient

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables are not set. Using dummy client.')
  // 더미 URL과 키로 클라이언트 생성 (실제 쿼리는 실패하지만 앱은 실행됨)
  supabase = createClient('https://dummy.supabase.co', 'dummy-key')
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

