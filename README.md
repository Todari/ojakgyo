# ojakgyo

## 카카오 네이티브 로그인 설정 가이드

현재 Supabase OAuth는 일시적으로 비활성화되어 있으며, 카카오 네이티브 SDK를 사용한 로그인을 구현했습니다.

### 1. Kakao 개발자 포털 설정

#### 1.1 앱 생성 및 설정
1. [Kakao Developers Portal](https://developers.kakao.com)에 로그인
2. "My Application" → "Add an application" 클릭
3. 앱 정보 입력:
   - App icon
   - App name
   - Company name
4. "Save" 클릭

#### 1.2 네이티브 앱 키 확인
- 앱 대시보드의 "App Keys" 섹션에서 "Native app key" 확인
- 이 값을 환경 변수로 설정합니다

#### 1.3 플랫폼 설정

**iOS 설정:**
1. "Platform" → "iOS" 추가
2. Bundle ID: `com.anonymous.ojakgyo`
3. "Save" 클릭

**Android 설정:**
1. "Platform" → "Android" 추가
2. Package Name: `com.anonymous.ojakgyo`
3. Market URL: 선택사항
4. "Save" 클릭

#### 1.4 카카오 로그인 활성화
1. "Product settings" → "Kakao Login" → "Kakao Login" 스위치 활성화
2. "Consent Items"에서 다음 스코프 설정:
   - `profile_nickname` (닉네임) - 필수
   - `profile_image` (프로필 사진) - 선택
   - `account_email` (이메일) - 선택

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 카카오 네이티브 앱 키 (필수)
EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY=your_kakao_native_app_key_here

# Supabase 설정 (현재 주석처리됨)
# EXPO_PUBLIC_SUPABASE_URL=https://tjwbbqtoewyabgr.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. 앱 실행

```bash
# 캐시 클리어 후 실행
npx expo start --clear

# iOS에서 실행 (개발 빌드 필요)
npx expo run:ios

# Android에서 실행 (개발 빌드 필요)
npx expo run:android
```

### 4. 네이티브 로그인 플로우

1. **사용자가 카카오 로그인 버튼 클릭**
2. **카카오 네이티브 SDK 호출**: `@react-native-seoul/kakao-login` 사용
3. **카카오 앱/웹뷰 열림**: 사용자가 카카오에서 로그인
4. **토큰 획득**: 카카오에서 OAuth 토큰 반환
5. **프로필 정보 획득**: `getProfile()` API로 사용자 정보 획득
6. **로컬 저장**: AsyncStorage에 사용자 정보 저장
7. **인증 상태 업데이트**: Auth Context에서 로그인 상태 관리

### 5. 주요 특징

- **네이티브 SDK 사용**: 더 안정적이고 빠른 로그인 경험
- **오프라인 세션 관리**: AsyncStorage를 사용한 로그인 상태 유지
- **간단한 구조**: Supabase 없이도 동작하는 독립적인 인증 시스템
- **타입 안전성**: TypeScript로 사용자 정보 타입 정의

### 6. 현재 구현된 기능

- ✅ 카카오 네이티브 로그인
- ✅ 사용자 정보 저장 (AsyncStorage)
- ✅ 로그인 상태 관리 (Auth Context)
- ✅ 자동 로그인 (앱 재시작시)
- ✅ 로그아웃 기능
- ⏸️ Supabase 연동 (주석처리됨)
- ⏸️ 데이터베이스 저장 (주석처리됨)

### 7. 데이터베이스 연동 (향후 재활성화 예정)

Supabase 문제가 해결되면 다음 코드의 주석을 해제하여 데이터베이스 연동을 재활성화할 수 있습니다:

**파일 위치:**
- `hooks/useAuth.tsx` - Supabase 인증 코드
- `app/auth/index.tsx` - OAuth 로그인 코드
- `app/helper/index.tsx` - 신청서 조회 코드
- `app/helper/register/complete.tsx` - 신청서 저장 코드

### 8. 디버깅

로그인 문제가 발생하면 다음을 확인하세요:

1. **환경 변수**: `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY`가 올바르게 설정되었는지 확인
2. **개발 빌드**: 카카오 네이티브 SDK는 Expo Go에서 동작하지 않으므로 개발 빌드 필요
3. **플랫폼 설정**: Kakao 개발자 포털에서 Bundle ID/Package Name이 올바른지 확인
4. **콘솔 로그**: 로그인 과정에서 발생하는 에러 메시지 확인

### 9. 참고 문서

- [Kakao Developers Portal](https://developers.kakao.com)
- [@react-native-seoul/kakao-login](https://github.com/react-native-seoul/react-native-kakao-login)
- [Expo Development Build](https://docs.expo.dev/develop/development-builds/introduction/)