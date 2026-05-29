# 🗒️ FloatNote

> 데스크톱 위에 떠다니는 나만의 감성 스티커 메모 앱

파스텔 감성의 포스트잇을 화면 어디든 자유롭게 배치하는 macOS 데스크탑 앱입니다.  
텍스트 메모부터 체크리스트, 순서 리스트까지 — 가볍고 항상 켜두고 싶은 "소프트한 기억 저장 공간"을 만들어줍니다.

---

## ✨ 주요 기능

### 🎨 파스텔 메모 카드
- 옐로우 · 핑크 · 라벤더 · 민트 · 블루 · 피치 6가지 파스텔 컬러
- 새 메모 생성 시 색상 자동 순환
- 부드러운 팝인/팝아웃 애니메이션

### 🖱️ 자유 배치
- 화면 어디든 드래그로 자유롭게 이동
- 우하단 핸들로 크기 조절
- 상단 드래그 영역으로 앱 창 이동

### 📝 3가지 작성 모드
- **텍스트** — 자유로운 메모 작성, 내용에 따라 자동 높이 확장
- **체크리스트** — 항목 체크 시 부드러운 취소선 애니메이션
- **순서 리스트** — 드래그로 항목 순서 재배치

### 📌 메모 관리
- 핀 고정 (항상 최상단 유지)
- 복제 · 아카이브 · 삭제
- 제목 편집

### 🔍 검색 & 필터
- 실시간 메모 내용 검색
- 컬러 필터 · 카테고리(개인 / 업무 / 아이디어) 필터

### ⌨️ 단축키
- `Cmd+Shift+N` — 새 메모 즉시 생성
- 캔버스 더블클릭 — 해당 위치에 메모 생성

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| UI 프레임워크 | React 18 + TypeScript |
| 스타일링 | Tailwind CSS (커스텀 파스텔 컬러 토큰) |
| 상태 관리 | Zustand |
| 데스크탑 런타임 | Electron 30 |
| 로컬 DB | better-sqlite3 |
| 아이콘 | lucide-react |
| 빌드 도구 | Vite + electron-builder |

---

## 🚀 시작하기

### 요구 사항

- Node.js 18+
- macOS (Apple Silicon)

### 개발 환경 실행

```bash
# 의존성 설치
npm install

# better-sqlite3 네이티브 모듈 빌드 (최초 1회)
npm run rebuild

# 개발 서버 + Electron 실행
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

빌드가 완료되면 아래 경로에 결과물이 생성됩니다.

```
release/0.1.2/
├── mac-arm64/FloatNote.app         ← 바로 실행 가능
└── FloatNote-0.1.2-arm64.dmg      ← 설치 패키지
```

### 아이콘 수정

```bash
# public/icon.svg 수정 후 PNG 재생성
node scripts/gen-icon.mjs
```

---

## 📁 프로젝트 구조

```
FloatNote/
├── electron/
│   ├── main.ts        # 메인 프로세스 (DB, IPC 핸들러, 전역 단축키)
│   └── preload.ts     # IPC 브릿지 (notes / checklist)
├── src/
│   ├── components/
│   │   ├── NoteCard.tsx       # 메모 카드 (드래그·리사이즈·모드 전환)
│   │   ├── ChecklistBody.tsx  # 체크리스트 UI
│   │   ├── OrderedBody.tsx    # 순서 리스트 UI
│   │   └── Toolbar.tsx        # 상단 툴바 (검색·필터·새 메모)
│   ├── store/
│   │   └── noteStore.ts       # Zustand 스토어
│   └── types/
│       └── index.ts           # 타입 정의
├── public/
│   ├── icon.svg               # 앱 아이콘 원본 (편집용)
│   └── icon.png               # 빌드용 아이콘 (1024×1024)
└── scripts/
    └── gen-icon.mjs           # SVG → PNG 변환 스크립트
```

---

## 💾 데이터 저장 위치

| 데이터 | 저장소 |
|--------|--------|
| 메모 · 체크리스트 | SQLite (`floatnote.db`) |

> 로컬 파일 경로 (macOS): `~/Library/Application Support/FloatNote/`

---

## 💡 알려진 제한 사항

- **코드 서명 없음** — macOS에서 "개발자를 확인할 수 없음" 경고가 표시될 수 있습니다.  
  `시스템 설정 → 개인 정보 보호 및 보안`에서 허용하거나, `우클릭 → 열기`로 실행하세요.

---

## 📝 업데이트 기록

버전별 상세 릴리즈 노트는 **[RELEASE_NOTES.md](./RELEASE_NOTES.md)** 에서 확인할 수 있어요.
