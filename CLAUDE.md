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
│       ├── [token].js     # 메뉴 페이지 (카테고리, 상품, 직원호출)
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
│   └── Toast.js           # 토스트 알림 Context Provider
├── hooks/
│   ├── useCategories.js   # GET /categories
│   ├── useProducts.js     # GET /products (카테고리 필터)
│   ├── useOrder.js        # POST /orders (useMutation)
│   ├── useStaffCall.js    # POST /staff-calls (useMutation)
│   └── useWebSocket.js    # ORDER_STATUS 이벤트 수신
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

### 인증
- 인증 없음. 테이블 토큰(URL 파라미터)으로 테이블 식별
- `GET /api/tables/token/[token]`으로 테이블 검증

### 스타일링
- styled-components 전용 (CSS 파일 없음)
- 모바일 최적화 (max-width: 480px)
- 주요 색상: #3182F6(파랑), #191F28(전경), #8B95A1(회색), #F5F6F8(배경)

### 뱃지 종류
추천, 사장님 추천, 인기, 시그니처, BEST, NEW, 품절

## 사용하는 API

| 메서드 | 경로 | 용도 |
|--------|------|------|
| GET | /categories | 카테고리 목록 |
| GET | /products | 상품 목록 (showOnTable 필터) |
| GET | /notices | 공지사항 |
| GET | /tables/token/:token | 테이블 토큰 검증 |
| POST | /orders | 주문 생성 |
| POST | /staff-calls | 직원 호출 |
| GET | /orders/table/:tableId | 테이블 주문내역 |
| WS | ORDER_STATUS | 주문 상태 실시간 수신 |
