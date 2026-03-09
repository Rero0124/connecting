# Connecting

WebRTC 기반 실시간 음성/화면공유 메신저 플랫폼

Connecting은 mediasoup SFU 서버를 직접 구성하여 다중 참여자 간 실시간 음성 채팅 및 화면 공유를 구현한 플랫폼입니다. Discord와 유사한 UI/UX를 가진 모던 다크 테마 메신저로, DM, 룸(서버), 친구 관리, 프로필 시스템 등을 지원합니다.

---

## 주요 기능

### 실시간 통신
- mediasoup Worker/Router/Transport 직접 구성
- WebRTC 음성(Opus) 및 화면공유(VP8/H264) 송신(Producer) 구현
- Socket.IO 기반 실시간 시그널링 및 메시지 전달

### 메신저
- **DM (다이렉트 메시지)** — 1:1 및 그룹 대화, 메시지 요청/스팸 분류
- **룸 (서버)** — 텍스트/음성 채널, 참여 코드 초대 시스템
- **친구 시스템** — 친구 추가/삭제, 친구 요청 수락/거절, 온라인 상태 표시

### 사용자
- **프로필** — 다중 프로필 지원, 프로필 이미지/상태 메시지 편집
- **인증** — JWT + cookie 기반, 다른 계정 로그인 및 프로필 전환
- **상태** — 온라인/오프라인 실시간 표시

### 플랫폼
- Electron 데스크탑 앱 지원
- HTTP/1, HTTP/2, HTTP/3 소켓 지원 옵션
- Swagger(`/api-docs`) API 문서 자동 생성
- Zod 스키마 기반 입력 검증

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js 15 (App Router, Turbopack), React 19, Redux Toolkit, Tailwind CSS v4 |
| **Backend** | Next.js API Routes, Socket.IO, mediasoup |
| **Database** | PostgreSQL 13+ |
| **ORM** | Prisma |
| **Auth** | JWT + cookie (jose) |
| **Validation** | Zod, zod-openapi |
| **Desktop** | Electron |
| **Styling** | Tailwind CSS v4, CSS Variables (다크 테마) |

---

## 프로젝트 구조

```
connecting/
├── app/                    # Next.js App Router
│   ├── (auth)/             # 인증 페이지 (로그인, 회원가입)
│   ├── (main)/             # 메인 레이아웃
│   │   ├── dm/             # DM 페이지
│   │   ├── friend/         # 친구 페이지
│   │   ├── room/           # 룸 페이지
│   │   └── user/           # 유저 페이지
│   ├── (setting)/          # 설정 페이지
│   ├── api/                # API 라우트
│   ├── api-docs/           # Swagger 문서
│   ├── actions/            # Server Actions
│   └── globals.css         # 디자인 시스템 (CSS Variables)
├── src/
│   ├── components/         # UI 컴포넌트
│   │   ├── auth/           # 로그인, 회원가입, 프로필 선택
│   │   ├── dm/             # DM 네비게이션, 채팅, 모달
│   │   ├── friend/         # 친구 네비게이션
│   │   ├── friendRequest/  # 친구 목록, 요청, 관리
│   │   ├── layout/         # 메인 레이아웃, 네비게이션
│   │   ├── profile/        # 프로필 편집, 변경 모달
│   │   ├── room/           # 룸 네비게이션, 채널
│   │   └── ui/             # 공통 UI (DragAbleDiv)
│   ├── lib/                # 유틸리티, 스키마, 상태관리
│   │   ├── features/       # Redux Toolkit 슬라이스
│   │   └── schemas/        # Zod 스키마
│   └── server/             # 서버 사이드 (Socket, Electron)
├── prisma/                 # Prisma 스키마 및 마이그레이션
├── server.ts               # 커스텀 Next.js 서버
├── socket.ts               # Socket.IO 서버
└── electron.js             # Electron 메인 프로세스
```

---

## UI/UX 디자인

모던 다크 테마 기반의 일관된 디자인 시스템:

- **색상** — 다크 네이비 배경(`#1a1a2e`), 퍼플 액센트(`#6c5ce7`)
- **컴포넌트** — 둥근 모서리(`rounded-xl`, `rounded-2xl`), 백드롭 블러 모달
- **인터랙션** — 호버 효과, 부드러운 트랜지션, 슬라이드 인 애니메이션
- **레이아웃** — Discord 스타일 아이콘 사이드바, 리사이즈 가능한 패널
- **상태 표시** — 온라인/오프라인 도트, 빈 상태 일러스트레이션

---

## 실행 방법

### 1. 환경변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성합니다:

```bash
cp .env.example .env
```

각 값을 환경에 맞게 수정하세요. 자세한 설명은 `.env.example` 파일을 참고하세요.

### 2. 설치

```bash
pnpm install
```

### 3. 데이터베이스 설정

```bash
# 마이그레이션 실행
pnpm prisma migrate dev

# (선택) 시드 데이터 추가
pnpm prisma db seed
```

### 4. 개발 서버 실행

```bash
# Next.js 개발 서버 (Turbopack)
pnpm dev

# Socket.IO 서버 (별도 터미널)
pnpm socket

# (선택) Electron 데스크탑 앱
pnpm electron
```

### 5. 프로덕션 빌드

```bash
pnpm build
pnpm start
```

---

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | Next.js 개발 서버 (Turbopack) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 실행 |
| `pnpm socket` | Socket.IO 서버 실행 |
| `pnpm electron` | Electron 앱 실행 |
| `pnpm lint` | ESLint 검사 |
| `pnpm lint:fix` | ESLint 자동 수정 |

---

## 라이선스

Private
