# Traffic Page

Next.js 16과 React 19로 구축된 현대적이고 사용자 정의 가능한 내비게이션 허브입니다.

## 기능

- **통합 내비게이션 허브** - 모든 웹사이트를 한 곳에서 정리 및 접근
- **내부/외부 네트워크 전환** - 내부 URL과 외부 URL 간 전환
- **사용자 정의 가능한 카테고리** - 자체 웹사이트 카테고리 생성 및 관리
- **풍부한 아이콘 지원** - 사용자 정의 색상이 지원되는 Font Awesome 아이콘
- **다중 테마 지원** - 라이트 모드 및 다크 모드
- **국제화** - i18next를 통한 다국어 지원
- **사용자 인증** - JWT 기반의 보안 인증 시스템
- **SQLite 데이터베이스** - better-sqlite3를 통한 로컬 데이터 저장
- **반응형 디자인** - Tailwind CSS 4로 구현된 아름다운 UI

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **UI 라이브러리**: React 19
- **언어**: TypeScript
- **스타일링**: Tailwind CSS 4
- **아이콘**: Font Awesome 7
- **데이터베이스**: better-sqlite3
- **인증**: JWT (jsonwebtoken)
- **국제화**: i18next, react-i18next
- **로깅**: Winston

## 시작하기

### 사전 요구사항

- Node.js 22+
- npm, yarn 또는 pnpm

### 설치

```bash
# 저장소 복제
git clone <repository-url>
cd traffic-page

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어주세요.

### 프로덕션 빌드

```bash
# 애플리케이션 빌드
npm run build

# 프로덕션 서버 시작
npm start
```

## Docker 배포

```bash
# Docker 이미지 빌드
docker build -t traffic-page .

# 컨테이너 실행
docker run -p 3000:3000 -v $(pwd)/data:/app/data traffic-page
```

## 프로젝트 구조

```
traffic-page/
├── src/
│   ├── app/              # Next.js App Router 페이지 및 API 라우트
│   ├── components/       # React 컴포넌트
│   ├── lib/              # 유틸리티 라이브러리 (인증, DB, 로깅, i18n)
│   ├── providers/        # React 컨텍스트 공급자
│   ├── types/            # TypeScript 타입 정의
│   └── utils/            # 유틸리티 함수
├── public/               # 정적 자산
└── package.json
```

## API 라우트

- `POST /api/user/register` - 사용자 등록
- `POST /api/user/login` - 사용자 로그인
- `GET /api/user/userinfo` - 사용자 정보 가져오기
- `GET /api/user/page` - 사용자 내비게이션 페이지 가져오기
- `POST /api/user/page` - 사용자 내비게이션 페이지 저장
- `GET /api/user/checkSystemInit` - 시스템 초기화 상태 확인
- `GET/POST /api/systemSetting/generalSetting` - 시스템 설정

## 기본 카테고리

애플리케이션에는 다음 카테고리가 미리 구성되어 있습니다:

- 빠른 액세스
- 일반 도구
- 개발
- 엔터테인먼트
- 운영체제
- 쇼핑
- 지식
- 게임

## 구성

### 환경 변수

루트 디렉토리에 `.env` 파일을 생성합니다:

```env
# 데이터베이스
DATABASE_PATH=./data/traffic.db

# JWT 시크릿(직접 생성하세요)
JWT_SECRET=your-secret-key

# 애플리케이션
NODE_ENV=production
PORT=3000
```

### 데이터베이스 초기화

데이터베이스는 처음 실행될 때 자동으로 초기화되며 다음 테이블이 생성됩니다:

- `t_user` - 사용자 계정
- `t_user_page` - 사용자 내비게이션 페이지
- `t_system_setting` - 시스템 설정

## 라이선스

이 프로젝트는 MIT 라이선스 하에 라이선스가 부여됩니다.