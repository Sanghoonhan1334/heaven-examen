# 천국고시 수기문 보관함

'천국고시'라는 이름의 연말 회고 + 내년 공부 계획 다짐 수집 사이트입니다.

## 기술 스택

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (Postgres + Auth + Storage)

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수를 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Supabase 데이터베이스 설정

Supabase 대시보드에서 다음 SQL을 실행하여 `essays` 테이블을 생성하세요:

```sql
CREATE TABLE essays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname TEXT,
  q1 TEXT NOT NULL,
  q2 TEXT NOT NULL,
  q3 TEXT NOT NULL,
  q4 TEXT NOT NULL,
  q5 TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 추가 (선택사항)
CREATE INDEX idx_essays_created_at ON essays(created_at DESC);
```

### 3. 의존성 설치

```bash
npm install
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
heaven-exam-essays/
├── app/
│   ├── page.tsx              # 홈 페이지
│   ├── home-client.tsx        # 홈 페이지 클라이언트 컴포넌트
│   ├── write/
│   │   └── page.tsx           # 수기 작성 페이지
│   ├── board/
│   │   ├── page.tsx           # 전체 보관함 페이지
│   │   └── board-client.tsx   # 보관함 클라이언트 컴포넌트
│   └── display/
│       ├── page.tsx           # 전시 모드 페이지
│       └── display-client.tsx # 전시 모드 클라이언트 컴포넌트
├── components/
│   ├── ui/                    # shadcn/ui 컴포넌트
│   ├── essay-card.tsx         # 수기 카드 컴포넌트
│   └── essay-detail-modal.tsx # 수기 상세 모달
├── lib/
│   ├── supabase.ts            # Supabase 클라이언트
│   └── actions.ts              # Server Actions
├── types/
│   └── essay.ts               # 타입 정의
└── public/
    └── images/
        └── stickers/          # 스티커 이미지 폴더
```

## 기능

### 1. 홈 페이지 (/)
- 최근 작성된 수기 카드 리스트 표시
- 카드 클릭 시 모달로 전체 내용 상세보기
- "수기 작성하기" 버튼

### 2. 작성 페이지 (/write)
- 5개의 질문에 대한 답변 입력
- 닉네임 입력 (선택사항)
- Supabase에 저장

### 3. 보관함 페이지 (/board)
- 모든 수기를 카드 형태로 조회
- 카드 클릭 시 모달로 상세보기
- 체크박스로 특정 글 선택 가능 (향후 전시용)

### 4. 전시 모드 페이지 (/display)
- 풀스크린 전시 페이지
- 카드들이 5초 간격으로 자동 슬라이드
- fade-in / fade-out 애니메이션

## 배경 이미지 (천국고시 세계관)

천국고시 세계관을 위한 배경 이미지를 `/public/bg` 폴더에 추가하세요:

- **`hill.png`** - 하단 언덕(동산) 배경 (가로로 넓은 곡선형 이미지 권장)
- **`cloud.png`** - 중간 구름 배경 (카드들이 떠 있는 공간)
- **`stairs.png`** - 상단 계단 이미지 (천국으로 이어지는 계단)
- **`gate.png`** - 상단 천국문 이미지 (목표와 이상향을 상징)

이미지가 없어도 그라데이션 fallback이 적용되어 정상 작동합니다.

## 스티커 이미지

`/public/images/stickers` 폴더에 PNG 스티커 파일을 업로드하면 카드에 표시됩니다.

## 배포

Vercel에 배포할 때는 환경 변수를 Vercel 대시보드에서 설정하세요.

## 디자인 컨셉

- Cloud Dancer 계열의 따뜻한 화이트/아이보리 배경
- 하늘색 그라데이션
- 구름 패턴 배경 요소
- 구름 위에 떠 있는 '다짐 카드' 느낌
