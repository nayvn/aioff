# aioff — 아이온2 캐릭터 조회

입력창 하나로 **서버 + 닉네임**을 검색해서 캐릭터 정보를 보여주는 모바일 우선 웹앱.
PC에서도 접속되지만 화면은 모바일 프레임(최대 520px)으로 가운데 정렬된다.

## 스택

React 19 · TypeScript · Vite · Tailwind CSS v4 · shadcn/ui
아이콘은 라이브러리 대신 이모지(💡🚨👻)를 쓴다.

## 보여주는 정보

| 탭 | 내용 |
| --- | --- |
| 요약 | 전투력, 템 레벨, 기본 스탯 6종, 신성 스탯 12종, 펫 / 날개 / 날개 스킨, 장착 칭호 |
| 장비 | 무기·방어구·장신구·룬·아르카나 33슬롯. 항목을 누르면 조율 / 마석 / 신석 상세 |
| 카드 | 데바니온 보드 8종 개방률, 보드를 누르면 15×15 노드 배치와 개방 효과 |
| 스킬 | 액티브 / 패시브 / DP, 장착 스킬은 ★ 표시 |

## 데이터 출처

아이온2 공식 **캐릭터 정보실**(`aion2.plaync.com`)이 자기 프론트엔드용으로 쓰는
엔드포인트를 그대로 호출한다. PLAYNC 오픈 API(제휴 필요)가 아니다.

| 용도 | 경로 |
| --- | --- |
| 서버 목록 | `GET /api/gameinfo/servers` |
| 캐릭터 검색 | `GET /api/search/character?keyword&race&serverId&sort=desc&page&size` |
| 캐릭터 정보 | `GET /api/character/info?characterId&serverId` |
| 장비·펫·스킬 | `GET /api/character/equipment?characterId&serverId` |
| 아이템 상세 | `GET /api/character/equipment/item?id&enchantLevel&characterId&serverId&slotPos` |
| 데바니온 보드 | `GET /api/character/daevanion/detail?characterId&serverId&boardId` |

주의할 점 두 가지.

- `race`(1=천족, 2=마족)는 **필수**다. 종족을 모를 때는 1·2를 동시에 조회해 합친다.
- 검색 결과의 `characterId`는 이미 URL 인코딩된 값(`...%3D`)이라 그대로 쿼리에 넣으면
  이중 인코딩되어 404가 난다. [src/lib/api.ts](src/lib/api.ts)의 `normalizeCharacterId`가 처리한다.

### 비공식 경로라는 점

공식 오픈 API가 아니므로 예고 없이 바뀌거나 막힐 수 있다. 호출량은 여유 있게 잡고,
차단되면 [src/lib/api.ts](src/lib/api.ts) 한 파일만 교체하면 되도록 fetch 레이어를 분리해 뒀다.

## CORS / 프록시

브라우저에서 `aion2.plaync.com`을 직접 부르면 CORS로 막힌다. 그래서 항상 같은 출처의
`/api/aion2/*` 를 부르고, 이걸 서버 쪽에서 중계한다.

- **개발**: [vite.config.ts](vite.config.ts)의 `server.proxy`
- **배포**: [functions/api/aion2/[[path]].ts](functions/api/aion2/) — Cloudflare Pages Function

GitHub Pages 같은 **순수 정적 호스팅에는 못 올린다**. 중계할 서버가 없어서 전부 CORS로 실패한다.

## 자동 배포

[.github/workflows/ci.yml](.github/workflows/ci.yml)

- 모든 브랜치 push / PR → `build` (npm ci + npm run build, 타입 체크 포함)
- `main` push → `deploy` (Cloudflare Pages, 프로젝트명 `aioff`)

리포지토리 **Settings → Secrets and variables → Actions** 에 두 개가 필요하다.

| Secret | 값 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare 대시보드 → My Profile → API Tokens → Create Token → **Edit Cloudflare Workers** 템플릿 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 대시보드 우측 하단 Account ID |

배포 주소는 `https://aioff.pages.dev`.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

## URL

상태가 주소에 남아서 링크를 그대로 공유할 수 있다.

- `/?q=지켈 아무개` — 검색 결과
- `/?c=<characterId>&s=<serverId>&t=equip` — 캐릭터 상세 + 탭
