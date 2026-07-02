# Security Policy / 보안 정책

이 문서는 본 프로젝트의 보안 취약점 신고 및 처리 방식을 안내합니다.  
This document explains how to report and handle security vulnerabilities in this project.

## Supported Versions / 지원 버전

현재 공개 저장소의 기본 브랜치(`main`) 기준 최신 버전만 보안 패치 대상으로 관리합니다.  
Only the latest version on the default branch (`main`) is actively maintained for security fixes.

| Version / 버전 | Supported / 지원 여부 |
| --- | --- |
| latest / 최신 | Yes / 지원 |
| older versions / 이전 버전 | No / 미지원 |

## Reporting a Vulnerability / 취약점 신고

보안 취약점은 공개 GitHub Issue로 등록하지 말아주세요.  
Please do not report security vulnerabilities through public GitHub issues.

취약점을 발견했다면 관리자/유지보수자에게 비공개로 알려주세요.  
If you discover a vulnerability, please report it privately to the maintainer.
E-mail: vnut_dev@yohane-aqours.com

신고 시 가능하면 아래 정보를 포함해주세요.  
Please include the following information if possible:

- 취약점 설명 / Description of the vulnerability
- 재현 방법 / Steps to reproduce
- 영향받는 파일, API, 기능 / Affected files, APIs, or features
- 예상 영향도 / Potential impact
- 가능한 수정 방향 / Suggested fix, if available

## Security-Sensitive Areas / 보안상 중요한 영역

이 프로젝트에서 특히 주의해야 할 영역은 다음과 같습니다.  
Security-sensitive areas in this project include:

- 관리자 인증 / Admin authentication
- 이미지 업로드 및 삭제 / Image upload and deletion
- VNDB API 연동 및 프록시 처리 / VNDB API integration and proxy handling
- 백업 및 복원 기능 / Backup and restore features

## Disclosure / 공개 원칙

취약점이 확인되면 가능한 범위에서 수정 후 공개합니다.  
Confirmed vulnerabilities will be disclosed after a fix is prepared when practical.

악용 가능성이 큰 내용은 패치 전까지 공개하지 않는 것을 원칙으로 합니다.  
Details with high exploitation risk should not be publicly disclosed before a patch is available.

## Out of Scope / 제외 범위

다음 항목은 보안 취약점으로 처리하지 않을 수 있습니다.  
The following may be considered out of scope:

- 실제 영향이 없는 단순 정보성 보고 / Informational reports without practical impact
- 브라우저 확장, 로컬 환경, 사용자 기기 문제 / Issues caused by browser extensions, local environments, or user devices
- 의도된 관리자 기능의 오용 / Misuse of intended admin-only features
- 이미 최신 버전에서 수정된 문제 / Issues already fixed in the latest version
