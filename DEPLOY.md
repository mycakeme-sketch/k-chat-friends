# GitHub · Vercel · Supabase 배포 가이드 (초보용)

## 1) Git 설치

1. 브라우저에서 **https://git-scm.com/download/win** 접속 후 Windows용 Git 설치 프로그램을 받아 실행합니다.
2. 설치 중 묻는 옵션은 대부분 **기본값(Next)** 으로 두어도 됩니다.
3. 설치 후 **PowerShell** 또는 **명령 프롬프트**를 새로 엽니다.
4. 아래를 입력해 버전이 나오면 성공입니다.

```bash
git --version
```

---

## 2) GitHub에 처음 올리기

아래에서 **`본인아이디`** 는 GitHub 로그인 아이디로 바꿉니다.

1. **GitHub 웹사이트**에서 로그인 → 오른쪽 위 **+** → **New repository**  
2. Repository name 예: `k-chat-friends`  
3. **Public** 선택 → **Create repository** (README는 없어도 됨)

4. PowerShell에서 프로젝트 폴더로 이동:

```powershell
cd c:\new_p\chat
```

5. Git 저장소로 만들기:

```powershell
git init
```

6. `.gitignore`에 이미 `.env*` 가 있어 **`.env.local`(비밀키)은 올라가지 않습니다.**  
   소스만 추가:

```powershell
git add .
git commit -m "Initial commit"
```

7. GitHub에서 안내하는 **main** 브랜치 이름으로 맞추기:

```powershell
git branch -M main
```

8. 원격 저장소 연결 (**URL은 본인 저장소 주소로**):

```powershell
git remote add origin https://github.com/본인아이디/k-chat-friends.git
```

9. 푸시:

```powershell
git push -u origin main
```

브라우저에서 GitHub 저장소에 파일이 보이면 성공입니다.

이후 수정할 때마다:

```powershell
git add .
git commit -m "설명 메시지"
git push
```

---

## 3) Supabase 준비 (DB + 익명 로그인)

### 3-1. 프로젝트 만들기

1. **https://supabase.com** 에 가입·로그인합니다.
2. **New project** → 이름·비밀번호(DB용) 설정 → 리전은 가까운 곳(예: Northeast Asia) 선택 → 생성을 기다립니다.

### 3-2. 익명 로그인 켜기

1. 왼쪽 메뉴 **Authentication** → **Providers** 로 갑니다.
2. **Anonymous** 를 찾아 **Enable** 을 켭니다. **Save** 합니다.

### 3-3. 테이블 만들기 (SQL 한 번에 실행)

1. 왼쪽 **SQL Editor** → **New query**  
2. 이 프로젝트의 **`supabase/schema.sql`** 파일 내용을 **전부 복사**해 붙여 넣습니다.
3. 오른쪽 아래 **Run** 을 누릅니다.  
4. **Success** 가 나오면 됩니다.

### 3-4. API 키 복사

1. **Project Settings**(톱니) → **API**  
2. **Project URL** → `.env.local` 의 `NEXT_PUBLIC_SUPABASE_URL`  
3. **anon public** 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`  

로컬 `c:\new_p\chat\.env.local` 예:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
OPENAI_API_KEY=sk-...
```

---

## 4) 이미지·동영상 (Supabase Storage, 선택)

- **`public` 폴더**에 넣은 파일은 Vercel에서 그대로 URL로 제공됩니다 (`/noah/avatar.png`).
- **큰 용량·업로드**를 쓰려면 Supabase **Storage**에 버킷을 만들고, 파일 URL을 `friends.ts`의 `src`에 넣습니다.
- Next.js `Image`로 Supabase Storage **공개 URL**을 쓰려면 `next.config.ts`에 프로젝트 URL 기준으로 `remotePatterns`가 들어가 있습니다(빌드 시 `NEXT_PUBLIC_SUPABASE_URL` 필요).

`<video src="...">` 는 **공개 URL**이면 별도 설정 없이 재생됩니다.

---

## 5) Vercel에 배포

1. **https://vercel.com** 에 GitHub로 로그인합니다.
2. **Add New…** → **Project** → 방금 만든 **저장소**를 선택합니다.
3. **Framework Preset**: Next.js 로 자동 인식됩니다.
4. **Environment Variables** 에 로컬 `.env.local` 과 **같은 이름**으로 추가합니다:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY` (서버에서만 사용)

5. **Deploy** 를 누릅니다.

배포가 끝나면 Vercel이 준 **도메인**으로 접속해 앱이 동작하는지 확인합니다.

---

## 6) 자주 하는 오류

- **Supabase 연결 오류 화면**: Vercel 환경 변수에 Supabase URL/anon 키가 빠졌거나, Anonymous 로그인을 켜지 않았을 수 있습니다.
- **테이블 없음 오류**: SQL Editor에서 `schema.sql` 전체를 다시 실행했는지 확인합니다.
