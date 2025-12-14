-- 좋아요 및 댓글 기능 추가 마이그레이션
-- Supabase SQL Editor에서 실행하세요

-- essays 테이블에 likes_count 컬럼 추가
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'essays' 
    AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE essays ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- comments 테이블 생성
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id UUID NOT NULL REFERENCES essays(id) ON DELETE CASCADE,
  nickname TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_comments_essay_id ON comments(essay_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- RLS 정책 설정
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 댓글 읽기 가능
CREATE POLICY "Allow public read access" ON comments
  FOR SELECT
  USING (true);

-- 모든 사용자가 댓글 작성 가능
CREATE POLICY "Allow public insert" ON comments
  FOR INSERT
  WITH CHECK (true);

