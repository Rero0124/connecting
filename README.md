# 📘 Connecting – 음성채팅 플랫폼폼

Connecting은 

---

## 🔧 기술 스택

- **Frontend**: NextJS
- **Backend**: NextJS, SocketIO
- **Database**: PostgreSQL 13+
- **Auth**: JWT + cookie
- **ORM/Query**: Prisma

---

## 📂 주요 디렉터리 구조

```
app/                  # NextJS Frontend 페이지
├── api/              # NextJS Backend 페이지
prisma/               # Prisma 설정
public/               # logo 등 정적 파일
src/
├── components/       # React Compoenets (NextJS 에서 불러와서 사용)
├── provider/         # Redux, Socket 등 전역 Provider
├── server/           # Socekt, Electron 등 서버 관련
├── types/            # 공통으로 사용 하는 타입
└── lib/              # Express 진입점
    ├── constants/    # 전역 상수 값 
    ├── features/     # Redux의 Slice
    ├── form/         # React From Actions API Hook
    ├── hooks/        # 커스텀 hook
    ├── openapi/      # openapi(swagger) 설정
    └── schemas/      # zod 스키마
```

## ⚙️ 실행 방법

### 1. `.env` 파일 설정

```
DATABASE_URL="postgresql://user:password@localhost:5432/connecting?schema=public"
HOST=localhost
PORT=3000
SOCKET_HOST=localhost
SOCKET_PORT=4000
HTTPS=false
SOCKET_HTTP=HTTP/1
#SOCKET_HTTP=HTTPS
#SOCKET_HTTP=HTTP/2
#SOCKET_HTTP=HTTP/3
SESSION_SECRET="secret key"
NEXT_PUBLIC_BASE_URL=https://your.nextjs.host.com
NEXT_PUBLIC_SOCKET_URL=https://your.socket.host.com
NEXT_PUBLIC_MEDIASOUP_URL=111.111.111.111   #loopback 제외
```

### 2. 설치 및 실행

```bash
yarn
yarn prisma migrate reset
yarn dev # or build and start
yarn socekt
yarn electron # 필요시
```
---