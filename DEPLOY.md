# Vercel 배포 가이드

## 방법 1: GitHub 연동 (권장) ⭐

### 1단계: GitHub에 코드 업로드

1. **GitHub 저장소 생성**
   - [GitHub](https://github.com)에 로그인
   - 우측 상단 `+` 버튼 → `New repository` 클릭
   - Repository name: `heaven-exam-essays` (또는 원하는 이름)
   - Public 또는 Private 선택
   - `Create repository` 클릭

2. **로컬에서 Git 초기화 및 푸시**
   ```bash
   # 프로젝트 폴더로 이동
   cd heaven-exam-essays
   
   # Git 초기화 (아직 안 했다면)
   git init
   
   # 모든 파일 추가
   git add .
   
   # 첫 커밋
   git commit -m "Initial commit"
   
   # GitHub 저장소 연결 (위에서 만든 저장소 URL 사용)
   git remote add origin https://github.com/사용자명/heaven-exam-essays.git
   
   # 코드 푸시
   git branch -M main
   git push -u origin main
   ```

### 2단계: Vercel에 배포

1. **Vercel 계정 생성**
   - [Vercel](https://vercel.com) 접속
   - `Sign Up` 클릭
   - GitHub 계정으로 로그인 (권장)

2. **프로젝트 가져오기**
   - Vercel 대시보드에서 `Add New...` → `Project` 클릭
   - `Import Git Repository`에서 방금 만든 GitHub 저장소 선택
   - `Import` 클릭

3. **프로젝트 설정**
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `npm install` (기본값)

4. **환경 변수 설정** ⚠️ 중요!
   - `Environment Variables` 섹션 클릭
   - 다음 변수 추가:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - 각 변수 추가 후 `Add` 클릭

5. **배포 시작**
   - `Deploy` 버튼 클릭
   - 빌드 완료까지 2-3분 소요
   - 완료되면 배포 URL이 생성됨 (예: `heaven-exam-essays.vercel.app`)

---

## 방법 2: Vercel CLI로 직접 배포

### 1단계: Vercel CLI 설치

```bash
npm install -g vercel
```

### 2단계: 로그인

```bash
vercel login
```

### 3단계: 프로젝트 폴더에서 배포

```bash
cd heaven-exam-essays
vercel
```

### 4단계: 설정 질문에 답변

- **Set up and deploy?** → `Y`
- **Which scope?** → 본인 계정 선택
- **Link to existing project?** → `N` (처음 배포)
- **What's your project's name?** → `heaven-exam-essays` (또는 원하는 이름)
- **In which directory is your code located?** → `./` (기본값)

### 5단계: 환경 변수 설정

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# 프롬프트에 Supabase URL 입력

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# 프롬프트에 Supabase Anon Key 입력
```

### 6단계: 프로덕션 배포

```bash
vercel --prod
```

---

## 배포 후 확인 사항

1. **배포 URL 확인**
   - Vercel 대시보드에서 배포된 URL 확인
   - 예: `https://heaven-exam-essays.vercel.app`

2. **환경 변수 확인**
   - Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
   - 모든 환경 변수가 제대로 설정되었는지 확인

3. **사이트 테스트**
   - 배포된 URL로 접속
   - 수기 작성/조회 기능 테스트
   - Supabase 연결 확인

---

## 문제 해결

### 빌드 에러 발생 시

1. **로컬에서 빌드 테스트**
   ```bash
   npm run build
   ```
   - 로컬에서 빌드가 성공해야 Vercel에서도 성공

2. **환경 변수 확인**
   - `.env.local` 파일은 Git에 올라가지 않음 (`.gitignore`에 포함)
   - Vercel 대시보드에서 환경 변수를 직접 설정해야 함

3. **Supabase 연결 확인**
   - Supabase 대시보드에서 프로젝트가 활성화되어 있는지 확인
   - RLS 정책이 올바르게 설정되었는지 확인

### 환경 변수 업데이트

- Vercel 대시보드 → Settings → Environment Variables
- 변수 수정 후 **재배포 필요** (자동으로 재배포되지 않음)
- 또는 `vercel --prod` 명령어로 재배포

---

## 커스텀 도메인 설정 (선택사항)

1. Vercel 대시보드 → 프로젝트 → Settings → Domains
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 제공업체에서 설정

---

## 자동 배포

GitHub 연동 시:
- `main` 브랜치에 푸시하면 자동으로 배포됨
- Pull Request 생성 시 Preview 배포도 자동 생성

---

## 참고

- Vercel은 무료 플랜 제공 (충분히 사용 가능)
- 빌드 시간: 보통 2-3분
- 배포 후 즉시 전 세계에서 접속 가능

