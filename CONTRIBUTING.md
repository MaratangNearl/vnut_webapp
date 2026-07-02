# Contributing / 기여 가이드

이 프로젝트에 관심을 가져주셔서 감사합니다.  
Thank you for your interest in contributing to this project.

본 문서는 이슈 제보, 코드 수정, Pull Request 작성 시 참고할 기본 가이드입니다.  
This document provides basic guidelines for issues, code changes, and pull requests.

## Development Setup / 개발 환경 설정

프로젝트를 로컬에서 실행하려면 다음 명령어를 사용합니다.  
Use the following commands to run the project locally:

```bash
npm install
npm run dev
```

빌드 확인은 다음 명령어로 진행합니다.  
Use the following command to verify the production build:

```bash
npm run build
```

린트 스크립트가 설정되어 있다면 다음 명령어도 실행해주세요.  
If a lint script is configured, please run:

```bash
npm run lint
```

## Pull Requests / Pull Request 작성

Pull Request를 보낼 때는 다음 내용을 포함해주세요.  
When submitting a pull request, please include:

- 변경한 내용 요약 / Summary of changes
- 변경이 필요한 이유 / Reason for the change
- UI 변경이 있는 경우 스크린샷 / Screenshots for UI changes, if applicable
- 테스트 또는 빌드 확인 결과 / Test or build verification results

## Code Style / 코드 스타일

기본 원칙은 다음과 같습니다.  
General guidelines:

- TypeScript 타입을 최대한 명확하게 유지합니다. / Keep TypeScript types clear and explicit when practical.
- 컴포넌트는 역할별로 작게 유지합니다. / Keep components focused and reasonably small.
- 비밀키, 토큰, API 키를 코드에 직접 넣지 않습니다. / Do not hardcode secrets, tokens, or API keys.
- 서버리스 API 관련 코드는 `functions/` 아래에 둡니다. / Keep serverless API code under `functions/`.
- 생성물 또는 로컬 캐시 파일은 커밋하지 않습니다. / Do not commit generated files or local cache files.

커밋하면 안 되는 대표적인 파일/폴더는 다음과 같습니다.  
Examples of files and directories that should not be committed:

```text
node_modules/
dist/
.wrangler/
.env
.env.*
*.tsbuildinfo
```

## Issues / 이슈 작성

버그를 제보할 때는 가능하면 다음 정보를 포함해주세요.  
When reporting a bug, please include:

- 발생한 문제 / What happened
- 기대한 동작 / Expected behavior
- 재현 방법 / Steps to reproduce
- 브라우저 및 OS 정보 / Browser and OS information
- 관련 스크린샷 또는 로그 / Relevant screenshots or logs

기능 제안의 경우, 어떤 문제를 해결하려는 기능인지 함께 적어주세요.  
For feature requests, please describe the problem the feature is intended to solve.

## Security Issues / 보안 이슈

보안 취약점은 공개 Issue로 등록하지 말아주세요.  
Please do not report security vulnerabilities through public issues.

보안 관련 내용은 `SECURITY.md`를 참고해주세요.  
For security-related reports, please refer to `SECURITY.md`.

## License / 라이선스

기여한 코드는 이 프로젝트의 라이선스인 MIT License에 따라 배포되는 것에 동의한 것으로 간주됩니다.  
By contributing, you agree that your contributions will be distributed under the MIT License used by this project.
