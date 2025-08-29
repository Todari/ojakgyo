## Ojakgyo – 구조/가이드

이 프로젝트는 어르신·도우미 매칭을 위한 모바일 앱입니다. 유지보수성과 확장성을 위해 UI/기능/데이터 계층을 명확히 분리하는 것을 목표로 리팩토링되었습니다.

### 핵심 스택
- Expo + React Native, Expo Router
- Supabase (Auth + DB) – `createClient<Database>`로 타입 안정성 보장
- React Query – 데이터 캐싱/리페치 표준화
- React Hook Form + Zod – 폼 상태/검증
- Naver Map (`@mj-studio/react-native-naver-map`), Expo Location

### 폴더 구조(요약)
```
app/                        # expo-router 기반 화면
  (tabs|stack)/*
features/                   # 도메인별 모듈
  auth/  services|hooks
  request/ services|hooks|schemas|components
  helper/  services|hooks|schemas|components
  map/     hooks|services
components/                 # 재사용 UI
  ui/ layout/ form/ category/
constants/                  # 색상/토큰(semantic), 팔레트
hooks/                      # cross-cutting 훅(guard 등)
utils/                      # supabase, config, logger, format
```

### 설계 원칙
- 화면은 입력/네비게이션만 담당. 데이터 접근은 훅(`features/*/hooks`)과 서비스(`features/*/services`)에서만 수행.
- 서비스는 Supabase 쿼리만 포함(순수 함수); 훅은 React Query로 캐싱/로딩/에러를 담당.
- 폼은 RHF + Zod 스키마로 검증/타입 동기화.
- 색상/타이포 등 스타일은 semantic 토큰만 사용(하드코딩 hex 금지).

### 인증/라우팅
- 카카오 OAuth(Supabase): `app/auth/index.tsx` → OAuth → `auth/callback/kakao` → `useAuth`에서 프로필 upsert/로드.
- `useAuthGuard`, `withRoleGuard`로 그룹/역할 기반 라우팅 제어.

### 데이터 계층 규약
- 서비스 예: `features/request/services/helpRequests.ts`
  - `listRequests`, `createHelpRequest`, `updateHelpRequest`, `deleteHelpRequest`…
- 훅 예: `features/request/hooks/useRequestList.ts`
  - Query Key 규칙: `['request', 'list']`, `['request', 'latest', userId]`
  - 변경 후 `queryClient.invalidateQueries({ queryKey: [...] })`로 최소 무효화

### 지도/위치 공통화
- `useLocationPermission`: 포그라운드/백그라운드 권한 요청 캡슐화
- `useNaverMarkers`: 좌표→스크린 좌표 계산 및 상태 관리

### 스타일 파운데이션
- `constants/colors.ts`: primitive 팔레트 + semantic 토큰(light/dark)
- `Typography`, `Button`, `Input`, `ToggleChip` 등은 토큰 기반으로 스타일링
- 화면/컴포넌트에서 hex 직접 사용 금지(토큰만 사용)

### 환경 변수
```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_NAVER_MAPS_KEY_ID=...
EXPO_PUBLIC_NAVER_MAPS_KEY=...
```
리다이렉트 URI: `ojakgyo://auth/callback/kakao`

### 개발 준비/실행
```bash
nvm use 22.17.0
yarn
npx expo start --clear
```

### 스크립트(요약)
```bash
# 개발 서버
yarn start

# iOS/Android 개발 빌드 실행
yarn ios
yarn android

# 타입/린트
yarn typecheck
yarn lint

# 테스트(도입 시)
yarn test
```

### 라우팅 구조(요약)
```
app/
  _layout.tsx                   # 루트(AuthProvider, QueryClientProvider, ErrorBoundary)
  (tabs)/                       # 하단 탭
    home/index.tsx
    chat/index.tsx
    profile/index.tsx
  (stack)/                      # 스택 화면들
    request/ [...].tsx
    helper/  [...].tsx
    chat/    [id].tsx
  auth/                         # 인증 그룹
    index.tsx                   # 로그인 진입
    callback/kakao/index.tsx    # OAuth 콜백 처리
```

### 코드 스타일/컨벤션
- 파일/폴더: 기능(도메인) 우선 구조(`features/*`). 화면은 얇게 유지.
- 네이밍: 서비스는 동사(행위), 훅은 `use*`, 컴포넌트는 PascalCase.
- 에러 처리: 서비스에서 throw, 훅/화면에서 사용자 메시지로 변환(`components/ui/Alert.ts`, `ErrorBoundary`).
- 커밋: feat/fix/refactor/chore/docs/test 형식, 명확한 서술.

### 향후 과제(추천)
- React Query 전면 적용(남은 훅 마이그레이션), 전역 ErrorBoundary 개선(재시도/리포트)
- 이미지 캐시(expo-image), 리스트 `getItemLayout` 도입, 스켈레톤 로딩 UI
- 서비스 유닛 테스트 확대 및 CI(린트/테스트) 파이프라인

---
문의/제안은 PR 또는 이슈로 남겨주세요. 유지보수와 기능 확장을 고려한 구조로 계속 고도화해 나갑니다.