-- q6, q7 컬럼 추가 마이그레이션
-- Supabase SQL Editor에서 이 파일의 내용을 복사해서 실행하세요

-- q6 컬럼 추가 (없는 경우에만)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'essays' 
    AND column_name = 'q6'
  ) THEN
    ALTER TABLE essays ADD COLUMN q6 TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'q6 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'q6 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- q7 컬럼 추가 (없는 경우에만)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'essays' 
    AND column_name = 'q7'
  ) THEN
    ALTER TABLE essays ADD COLUMN q7 TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'q7 컬럼이 추가되었습니다.';
  ELSE
    RAISE NOTICE 'q7 컬럼이 이미 존재합니다.';
  END IF;
END $$;

-- 기존 데이터 확인 (선택사항)
SELECT COUNT(*) as total_essays FROM essays;

