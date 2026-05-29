# v0.1.2

## 🐛 버그 수정

### 메모 저장 안 되는 문제 수정
- preload 경로 오타(`preload.js` → `preload.mjs`)로 `window.floatAPI`가 undefined가 되어 모든 DB 저장이 스킵되던 문제 수정
- better-sqlite3 named parameter에 extra 필드가 전달되어 INSERT/UPDATE가 실패하던 문제 수정

## ✨ 새 기능

### 툴바 버전 표시
- 툴바 오른쪽 끝에 현재 앱 버전 표시

---

## 📦 설치 방법

| 플랫폼 | 파일 |
|--------|------|
| macOS (Apple Silicon) | `FloatNote-0.1.2-arm64.dmg` |

> ⚠️ **macOS** — "개발자를 확인할 수 없음" 경고가 뜨면 `시스템 설정 → 개인 정보 보호 및 보안`에서 허용하거나, `우클릭 → 열기`로 실행하세요.

