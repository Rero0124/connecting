# 📘 Connecting – WebRTC 기반 실시간 음성/화면공유 플랫폼

Connecting은 mediasoup SFU 서버를 직접 구성하여 다중 참여자 간 실시간 음성 채팅 및 화면 공유를 구현한 플랫폼입니다.
WebRTC 송신(Producer) 구현 및 테스트 완료, 수신(Consumer) 연결 구조까지 설계되어 있습니다.

---

## ✅ 구현 완료 기능

- mediasoup Worker/Router/Transport 직접 구성
- - WebRTC 음성(Opus) 및 화면공유(VP8/H264) 송신(Producer) 구현 및 테스트 완료
  - - Socket.IO 기반 실시간 시그널링
    - - JWT + cookie 인증
      - - Electron 데스크탑 앱 지원
        - - HTTP/1, HTTP/2, HTTP/3 소켓 지원 옵션
          - - Swagger(/api-docs) API 문서화
            - - Zod 스키마 기반 입력 검증
             
              - ---

              ## 🔧 기술 스택

              - **Frontend**: NextJS, Redux Toolkit
              - - **Backend**: NextJS, Socket.IO, mediasoup
                - - **Database**: PostgreSQL 13+
                  - - **Auth**: JWT + cookie
                    - - **ORM/Query**: Prisma
                      - - **Desktop**: Electron
                        - - **Validation**: Zod, OpenAPI/Swagger
                         
                          - ---

                          ## ⚙️ 실행 방법

                          ### 1. .env 파일 설정

                          ```env
                          DATABASE_URL="postgresql://user:password@localhost:5432/connecting?schema=public"
                          HOST=localhost
                          PORT=3000
                          SOCKET_HOST=localhost
                          SOCKET_PORT=4000
                          HTTPS=false
                          SOCKET_HTTP=HTTP/1
                          SESSION_SECRET="secret key"
                          NEXT_PUBLIC_BASE_URL=https://your.nextjs.host.com
                          NEXT_PUBLIC_SOCKET_URL=https://your.socket.host.com
                          NEXT_PUBLIC_MEDIASOUP_URL=111.111.111.111
                          ```

                          ### 2. 설치 및 실행

                          ```bash
                          yarn
                          yarn prisma migrate reset
                          yarn dev
                          yarn socket
                          yarn electron
                          ```
