-- RLS 정책 확인 및 수정 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. 현재 RLS 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'essays';

-- 2. RLS가 활성화되어 있는지 확인
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'essays';

-- 3. RLS 정책이 없거나 잘못된 경우, 다음을 실행하세요:

-- 기존 정책 삭제 (필요한 경우)
-- 인증 기반 정책 제거 (충돌 방지)
DROP POLICY IF EXISTS "Users can delete own essays" ON essays;
DROP POLICY IF EXISTS "Users can update own essays" ON essays;

-- 공개 정책 제거 (재생성을 위해)
DROP POLICY IF EXISTS "Allow public delete" ON essays;
DROP POLICY IF EXISTS "Allow public update" ON essays;
DROP POLICY IF EXISTS "Allow public insert" ON essays;
DROP POLICY IF EXISTS "Allow public read access" ON essays;

-- RLS 활성화
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Allow public read access" ON essays
  FOR SELECT
  USING (true);

-- 모든 사용자가 삽입 가능
CREATE POLICY "Allow public insert" ON essays
  FOR INSERT
  WITH CHECK (true);

-- 모든 사용자가 업데이트 가능
CREATE POLICY "Allow public update" ON essays
  FOR UPDATE
  USING (true);

-- 모든 사용자가 삭제 가능
CREATE POLICY "Allow public delete" ON essays
  FOR DELETE
  USING (true);

-- 4. 모든 수기 삭제 (주의: 실행 전에 확인하세요!)
-- 먼저 현재 수기 개수 확인
SELECT COUNT(*) as total_essays FROM essays;

-- 모든 수기 삭제
DELETE FROM essays;

-- 삭제 후 확인
SELECT COUNT(*) as remaining_essays FROM essays;

