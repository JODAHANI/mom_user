# Client (table-home-client)

고객용 테이블 주문 화면. 모바일 QR 스캔으로 진입하여 메뉴 탐색, 장바구니, 주문을 수행한다.

## 실행

```bash
npm run dev   # localhost:3001 (0.0.0.0 바인딩)
npm run build
npm start     # 프로덕션 3001
```

## 기술 스택

- Next.js 16 (Pages Router) / React 19 / JavaScript (TS 없음)
- styled-components (CSS-in-JS, next.config.js 컴파일러 활성화)
- @tanstack/react-query (서버 상태 - staleTime 1분, retry 1회)
- jotai (클라이언트 상태 - 장바구니)
- axios (HTTP 클라이언트)
- WebSocket (ws) - 실시간 주문 상태 업데이트

## 환경변수

```
NEXT_PUBLIC_API_PORT=5001   # 백엔드 API 포트
```

## 디렉토리 구조

```
client/
├── pages/
│   ├── _app.js           # QueryClient, GlobalStyle, ToastProvider
│   ├── _document.js      # SSR styled-components, lang="ko"
│   ├── index.js           # QR 스캔 안내 랜딩
│   ├── demo.js            # 서버 없이 테스트용 (하드코딩 데이터)
│   └── table/
│       ├── index.js       # 세션 토큰 게이트 → [token] 리다이렉트 (없으면 TableGuide)
│       ├── cart.js        # 세션 토큰 게이트 → [token]/cart 리다이렉트
│       ├── [token].js     # 메뉴 페이지 (카테고리, 상품, 직원호출, 세션 만료 처리)
│       └── [token]/
│           └── cart.js    # 장바구니 + 주문 제출
├── components/
│   ├── Header.js          # 상단 네비 (직원호출, 주문내역, 장바구니)
│   ├── CartBar.js         # 하단 고정 장바구니 요약 바
│   ├── CategoryTabs.js    # 카테고리 가로 스크롤 탭
│   ├── MenuItem.js        # 메뉴 카드 (이미지, 뱃지, 품절)
│   ├── MenuList.js        # 메뉴 그리드 컨테이너
│   ├── PromoBanner.js     # 공지사항 배너 (펼침/접기)
│   ├── OrderHistory.js    # 주문내역 바텀시트 (10초 갱신, 스와이프 닫기)
│   ├── StaffCallSheet.js  # 직원호출 바텀시트 (호출 항목 다중선택 → POST /staff-calls)
│   ├── LoadingScreen.js   # 로딩 화면 (점 3개 바운스, message props)
│   ├── TableGuide.js      # QR 스캔 안내 화면 (토큰 없이 진입 시)
│   ├── ExpiredScreen.js   # 결제 완료/세션 만료 화면 (이전 주문내역 링크)
│   └── Toast.js           # 토스트 알림 Context Provider
├── hooks/
│   ├── useCategories.js   # GET /categories
│   ├── useProducts.js     # GET /products (카테고리 필터)
│   ├── useCallItems.js    # GET /call-items (5분 staleTime, StaffCallSheet 항목)
│   ├── useOrder.js        # POST /orders (useMutation)
│   ├── useStaffCall.js    # POST /staff-calls (useMutation, items[] 포함)
│   ├── useSession.js      # 테이블별 세션 시작 시각 저장, lastClearedAt 비교로 만료 판정
│   └── useWebSocket.js    # NEW_ORDER / ORDER_STATUS / TABLE_CLEARED 수신 (해당 테이블만 React Query 무효화 + 토스트)
├── lib/
│   ├── api.js             # axios 인스턴스 (동적 baseURL)
│   └── websocket.js       # WebSocketManager (자동 재연결 3초)
├── store/
│   └── cartAtom.js        # 장바구니 atoms (items, count, total, actions)
└── public/images/         # 상품 이미지 10개 (PNG)
```

## 주요 패턴

### API 통신
- `lib/api.js`에서 axios 인스턴스 생성. 클라이언트: `window.location.hostname:PORT/api`, 서버: `localhost:PORT/api`
- 조회: useQuery 커스텀 훅 / 변경: useMutation 커스텀 훅

### 상태 관리
- 서버 상태: React Query (categories, products, orders)
- 클라이언트 상태: Jotai atoms (장바구니 - cartItemsAtom, 파생 atoms)
- UI 상태: useState (모달, 선택된 카테고리 등)

### 인증 / 세션
- 인증 없음. 테이블 토큰(URL 파라미터)으로 테이블 식별
- `GET /api/tables/token/[token]`으로 테이블 검증
- `sessionStorage.currentToken`에 현재 테이블 토큰 저장 → `/table`, `/table/cart` 새로고침 시 자동 복원
- `useSession`: 테이블별 세션 시작 시각을 `sessionStorage`에 저장. 테이블의 `lastClearedAt`이 더 늦으면 `expired=true` → `ExpiredScreen` 노출

### 스타일링
- styled-components 전용 (CSS 파일 없음)
- 모바일 최적화 (max-width: 480px)
- 주요 색상: #c3904a(황동 골드), #1a1510(전경), #8c8278(웜그레이), #f5f1eb(배경)

### 뱃지 종류
추천, 사장님 추천, 인기, 시그니처, BEST, NEW, 품절

## 사용하는 API

| 메서드 | 경로 | 용도 |
|--------|------|------|
| GET | /categories | 카테고리 목록 |
| GET | /products | 상품 목록 (showOnTable 필터) |
| GET | /notices | 공지사항 |
| GET | /call-items | 직원호출 시트의 선택 항목 목록 |
| GET | /tables/token/:token | 테이블 토큰 검증 |
| POST | /orders | 주문 생성 (sessionStartedAt 포함, 409 시 세션 만료) |
| POST | /staff-calls | 직원 호출 (items[] 다중선택, sessionStartedAt 포함) |
| GET | /orders/table/:tableId | 테이블 주문내역 (?after=sessionStartedAt) |
| WS | NEW_ORDER | 같은 테이블 새 주문 수신 → 주문내역 무효화 |
| WS | ORDER_STATUS | 주문 상태 실시간 수신 + 토스트 |
| WS | TABLE_CLEARED | 세션 만료 (테이블 비우기) 감지 → ExpiredScreen 전환 |
