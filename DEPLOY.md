# GitHub · Vercel · Supabase 배포 가이드 (초보용)

이 문서는 **비밀번호·API 키를 GitHub에 올리지 않으면서** 로컬에서 개발하고, Vercel에 배포하는 흐름을 한 번에 설명합니다.

---

## 목차

1. [먼저 이해하기: `.env.local`은 왜 GitHub에 없나요?](#0-먼저-이해하기-envlocal은-왜-github에-없나요)
2. [Git 설치](#1-git-설치)
3. [GitHub에 처음 올리기](#2-github에-처음-올리기)
4. [Supabase 준비](#3-supabase-준비-db--익명-로그인)
5. [로컬에서 실행할 때 (`.env.local`)](#4-로컬에서-실행할-때-envlocal)
6. [이미지·동영상](#5-이미지동영상)
7. [Vercel에 배포할 때 (환경 변수)](#6-vercel에-배포할-때-환경-변수)
8. [자주 하는 오류](#7-자주-하는-오류)

---

## 0. 먼저 이해하기: `.env.local`은 왜 GitHub에 없나요?

### 핵심만 정리

| 구분 | 설명 |
|------|------|
| **GitHub에 올리는 것** | 소스 코드(`.ts`, `.tsx` 등)만 올립니다. |
| **GitHub에 올리면 안 되는 것** | API 키, DB 비밀번호처럼 **남에게 알리면 안 되는 문자열**입니다. |
| **`.env.local`의 역할** | 내 컴퓨터에만 두는 **비밀 설정 파일**입니다. 이름에 `.local`이 들어가고, 이 프로젝트의 `.gitignore`에 `.env*`가 있어서 **`git push`해도 GitHub에는 안 올라갑니다.** |

그래서 **“GitHub에는 `.env.local`이 없는데 어떻게 하라는 거야?”**라고 느끼시는 게 정상입니다.  
답은 **두 군데**입니다.

1. **내 PC에서 개발할 때** → 프로젝트 폴더에 직접 `.env.local` 파일을 만들고, 키를 넣습니다. (`c:\new_p\chat\.env.local`)
2. **Vercel에 배포할 때** → GitHub가 아니라 **Vercel 웹사이트의 “환경 변수” 입력칸**에 **같은 이름·같은 값**을 또 넣어줍니다. 그러면 클라우드에서 돌아가는 앱도 같은 키를 쓸 수 있습니다.

즉, **비밀은 “저장소”가 아니라 “각 실행 환경(내 PC / Vercel)”에 따로 넣는다**고 이해하시면 됩니다.

---

## 1. Git 설치

1. 브라우저에서 **https://git-scm.com/download/win** 접속 → Windows용 설치 파일 실행.
2. 설치 옵션은 대부분 **기본값(Next)** 으로 진행해도 됩니다.
3. 설치 후 **PowerShell**을 새로 열고:

```powershell
git --version
```

버전 숫자가 나오면 성공입니다.

---

## 2. GitHub에 처음 올리기

**`본인아이디`**, **`저장소이름`**은 본인 GitHub 계정에 맞게 바꿉니다.

1. **https://github.com** 로그인 → 오른쪽 위 **+** → **New repository**
2. Repository name 예: `k-chat-friends` → **Public** → **Create repository**

3. PowerShell:

```powershell
cd c:\new_p\chat
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

4. 원격 저장소 연결 (URL은 GitHub가 만든 저장소 주소 그대로):

```powershell
git remote add origin https://github.com/본인아이디/k-chat-friends.git
```

**이미 `origin`이 있다**는 오류가 나면, **추가(`add`)가 아니라 주소만 바꿉니다:**

```powershell
git remote set-url origin https://github.com/본인아이디/k-chat-friends.git
```

현재 설정 확인:

```powershell
git remote -v
```

5. 푸시:

```powershell
git push -u origin main
```

이후 수정할 때마다:

```powershell
git add .
git commit -m "변경 설명"
git push
```

---

## 3. Supabase 준비 (DB + 익명 로그인)

### 3-1. 프로젝트 만들기

1. **https://supabase.com** 가입·로그인
2. **New project** → 이름·DB 비밀번호 설정 → 가까운 리전 선택 → 생성 완료까지 대기

### 3-2. 익명 로그인 켜기

1. 왼쪽 **Authentication** → **Providers**
2. **Anonymous** → **Enable** → **Save**

### 3-3. 테이블 만들기 (SQL)

1. 왼쪽 **SQL Editor** → **New query**
2. 이 프로젝트의 **`supabase/schema.sql`** 파일 내용을 **전부** 복사해 붙여 넣기
3. **Run** → 성공 메시지 확인

### 3-4. “Project URL”이 뭐고, 어디서 보나요? (질문 많은 부분)

Supabase에는 **프로젝트마다 하나씩** 이런 주소가 붙습니다.

```text
https://abcdefghijklmnop.supabase.co
```

이 주소가 바로 앱에서 쓰는 **API 서버 주소(프로젝트 URL)** 입니다.

**같은 주소**를 여러 화면에서 볼 수 있습니다.

| 어디서 보나요? | 설명 |
|----------------|------|
| **프로젝트 대시보드 상단 / Overview** | 예: `https://awynnwuykuiwfvpzyegt.supabase.co` 처럼 보이는 링크 → **이게 곧 `NEXT_PUBLIC_SUPABASE_URL`에 넣을 주소**입니다. |
| **Project Settings(왼쪽 맨 아래 톱니) → API** | **Project URL** 이라는 항목에 **똑같은 형식**의 `https://xxxx.supabase.co` 가 적혀 있습니다. 여기서 **복사**해도 되고, Overview에 보이는 것을 써도 됩니다. |

즉, **“Overview에 보이는 `https://....supabase.co` = API 설정 화면의 Project URL”** 이라고 생각하시면 됩니다. 둘 중 **하나만** 복사해서 쓰면 됩니다.

**anon public 키**는 반드시 **Project Settings → API** 화면에 있습니다.

- **Project API keys** 섹션  
- **`anon` `public`** 이라고 적힌 긴 문자열(보통 `eyJ` 로 시작) → 이것이 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 입니다.  
- **service_role** 키는 브라우저에 넣으면 안 되므로, 이 앱에서는 사용하지 않습니다.

---

## 4. 로컬에서 실행할 때 (`.env.local`)

1. **메모장이나 Cursor**로 프로젝트 **루트**(`c:\new_p\chat`)에 파일을 새로 만듭니다.
2. 파일 이름을 정확히 **`.env.local`** 로 합니다. (앞에 점, 확장자 `.local`)
3. 아래처럼 **한 줄에 하나씩** 넣습니다. `=` 오른쪽에 **따옴표 없이** 붙여 넣어도 됩니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://본인프로젝트ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJI... (anon public 전체)
OPENAI_API_KEY=sk-... (OpenAI 키가 있을 때)
```

- `NEXT_PUBLIC_` 이 붙은 두 개는 **브라우저에서도** 쓰이므로 Supabase에서 말하는 **anon public**만 사용합니다.
4. 저장한 뒤 터미널에서:

```powershell
cd c:\new_p\chat
npm run dev
```

브라우저에서 앱이 뜨고, Supabase 연결 오류가 없으면 성공입니다.

**이 파일은 Git에 안 올라갑니다.** 팀원에게 키를 따로 전달하거나, 각자 Supabase에서 같은 프로젝트를 쓰거나, Vercel에는 아래 6절처럼 따로 넣습니다.

---

## 5. 이미지·동영상

- **`public` 폴더**에 넣은 파일 → 배포 후 주소는 `https://내사이트.vercel.app/noah/avatar.png` 처럼 **경로만** 붙이면 됩니다.
- **Supabase Storage**에 올린 파일 → Storage에서 **공개 URL**을 복사해 `friends.ts` 등에 넣습니다.
- Next.js `Image`로 Supabase Storage 이미지를 쓰려면 빌드 시 `NEXT_PUBLIC_SUPABASE_URL`이 있어야 하며, `next.config.ts`에 해당 호스트가 포함되어 있습니다.
- `<video src="공개 URL">` 은 별도 설정 없이 재생됩니다.

---

## 6. Vercel에 배포할 때 (환경 변수)

GitHub에는 **코드만** 있고 `.env.local`은 없으므로, **Vercel이 키를 알 수 있게** Vercel 화면에서 직접 넣어줘야 합니다.

1. **https://vercel.com** → GitHub로 로그인
2. **Add New…** → **Project** → 배포할 **저장소** 선택 → **Import**
3. **Framework Preset**: Next.js 로 두면 됩니다.
4. **Environment Variables** 섹션을 펼칩니다.
5. 아래 **이름(Name)** 과 **값(Value)** 을 **로컬 `.env.local`과 동일하게** 추가합니다.

| Name (이름) | Value (값)에 넣을 것 |
|-------------|----------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase **Project URL** (`https://....supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon public** 키 전체 |
| `OPENAI_API_KEY` | OpenAI API 키 (`sk-...`) |

6. **Production**(및 필요하면 Preview)에 체크되어 있는지 확인
7. **Deploy**

배포가 끝나면 Vercel이 주는 주소(예: `https://k-chat-friends.vercel.app`)로 접속해 동작을 확인합니다.

**환경 변수를 나중에 바꿨다면** Vercel에서 **Redeploy**(다시 배포)해야 반영되는 경우가 많습니다.

---

## 7. 자주 하는 오류

- **`remote origin already exists`**  
  → 이미 `origin`이 있을 때는 `git remote add` 대신 `git remote set-url origin <URL>` 을 사용합니다.

- **앱에 “Supabase 설정 필요” 같은 화면**  
  → 로컬: `.env.local` 유무·변수 이름 오타 확인.  
  → Vercel: **Environment Variables**에 세 값이 모두 들어갔는지, 배포 후 **재배포** 했는지 확인.

- **Anonymous 로그인 안 됨**  
  → Supabase **Authentication → Providers → Anonymous** 가 켜져 있는지 확인.

- **DB 오류 / 테이블 없음**  
  → **SQL Editor**에서 `supabase/schema.sql` 전체를 다시 실행했는지 확인.

---

## 한 줄 요약

- **비밀 키는 GitHub에 안 올린다.**  
- **내 PC**에는 `.env.local`, **Vercel**에는 사이트의 환경 변수에 **같은 이름으로** 넣는다.  
- **Supabase 주소**는 Overview에 보이는 `https://....supabase.co` 와 **Settings → API → Project URL** 이 같은 것이다.
