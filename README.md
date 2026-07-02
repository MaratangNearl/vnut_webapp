VNDB Tierboard — 게임 관리 웹앱
================================

설명
----

이 저장소는 VNDB(비주얼노벨 데이터베이스)를 활용한 개인용 게임 관리 및 티어보드 웹 애플리케이션입니다. 프런트엔드는 Vite + React(TypeScript)로 작성되어 있으며, 간단한 서버리스 API(또는 함수)는 `functions/` 폴더에 포함되어 있습니다.

주요 기능
----

- 게임 목록 보기 및 정리
- 티어보드(랭킹) 생성 및 편집
- 게임 카드, 모달(추가/수정/백업/복원) UI
- VNDB 연동을 통한 메타데이터 조회

프로젝트 구조(요약)
----

- `src/` — React 앱 소스
- `src/components/` — UI 컴포넌트
- `src/lib/` — VNDB 호출 및 클라이언트 유틸
- `functions/` — 서버리스 함수(예: `api/vndb.ts`)
- `public/` — 정적 자산
- `package.json` — 스크립트 및 의존성

요구사항
----

- Node.js 최신 LTS (권장: 18 이상)
- npm 또는 pnpm

설치 및 개발 실행
----

터미널에서 의존성을 설치하고 개발 서버를 실행하세요:

```bash
npm install
npm run dev
```

빌드 및 미리보기
----

```bash
npm run build
npm run preview
```

환경 변수
----

프로젝트에서 외부 API 키나 엔드포인트를 사용하는 경우 루트 또는 `functions/`에서 `.env` 파일을 확인하세요. 예: VNDB와 연동하는 키 또는 커스텀 API 엔드포인트.

배포
----

- 정적 사이트(프런트엔드): Vercel, Netlify, GitHub Pages 등
- 서버리스 함수: Vercel Functions, Netlify Functions 또는 클라우드 제공자에 배포

기여
----

기여 방법은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고해주세요.

보안
----

보안 취약점은 공개 Issue로 올리지 말고, [SECURITY.md](./SECURITY.md)를 참고해 제보해주세요.

라이선스
----

이 프로젝트는 MIT License로 배포됩니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참고하세요.

문의
----

추가 수정이나 README 내용 반영을 원하시면 알려주세요.

E-mail: vnut_dev@yohane-aqours.com