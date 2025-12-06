-- 천국고시 수기문 보관함 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- essays 테이블 생성
CREATE TABLE IF NOT EXISTS essays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT,
  q1 TEXT NOT NULL,
  q2 TEXT NOT NULL,
  q3 TEXT NOT NULL,
  q4 TEXT NOT NULL,
  q5 TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_essays_created_at ON essays(created_at DESC);

-- RLS (Row Level Security) 정책 설정 (선택사항)
-- 모든 사용자가 읽기 가능하도록 설정
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Allow public read access" ON essays
  FOR SELECT
  USING (true);

-- 모든 사용자가 삽입 가능 (익명 사용자도 작성 가능)
CREATE POLICY "Allow public insert" ON essays
  FOR INSERT
  WITH CHECK (true);

-- 모든 사용자가 업데이트/삭제 가능 (localStorage 기반 권한 관리)
-- 실제 프로덕션에서는 인증을 사용하여 본인만 수정/삭제 가능하도록 설정하는 것을 권장합니다
CREATE POLICY "Allow public update" ON essays
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete" ON essays
  FOR DELETE
  USING (true);

