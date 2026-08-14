import { useCallback, useEffect, useMemo, useState } from 'react'
import { getServers, normalizeCharacterId } from '@/lib/api'
import { parseQuery } from '@/lib/api'
import type { SearchCharacter, ServerInfo } from '@/lib/aion2'
import { CharacterView } from '@/components/character-view'
import { HomeView, SearchView } from '@/components/search-view'
import { EmptyState } from '@/components/common'
import { Input } from '@/components/ui/input'

const RECENT_KEY = 'aioff.recents'

function readRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

/** 서버 칩을 눌렀을 때 이미 적혀 있던 서버명은 빼고 닉네임만 남긴다. */
function stripKnownServer(draft: string, servers: ServerInfo[]) {
  return parseQuery(draft, servers).keyword
}

function useRoute() {
  const [search, setSearch] = useState(() => window.location.search)

  useEffect(() => {
    const onPop = () => setSearch(window.location.search)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((params: Record<string, string> | null) => {
    const qs = params ? new URLSearchParams(params).toString() : ''
    const url = qs ? `?${qs}` : window.location.pathname
    window.history.pushState(null, '', url)
    setSearch(qs ? `?${qs}` : '')
  }, [])

  return { params: useMemo(() => new URLSearchParams(search), [search]), navigate }
}

function App() {
  const { params, navigate } = useRoute()
  const [servers, setServers] = useState<ServerInfo[]>([])
  const [serverError, setServerError] = useState(false)
  const [draft, setDraft] = useState('')
  const [recents, setRecents] = useState<string[]>(readRecents)

  const query = params.get('q') ?? ''
  const characterId = params.get('c')
  const serverId = Number(params.get('s') ?? 0)

  useEffect(() => {
    getServers()
      .then(setServers)
      .catch(() => setServerError(true))
  }, [])

  useEffect(() => {
    setDraft(query)
  }, [query])

  const pushRecent = useCallback((q: string) => {
    setRecents((prev) => {
      const next = [q, ...prev.filter((p) => p !== q)].slice(0, 8)
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      } catch {
        // 저장 실패는 무시
      }
      return next
    })
  }, [])

  const submit = (raw: string) => {
    const q = raw.trim()
    if (!q) return
    pushRecent(q)
    navigate({ q })
  }

  const pickCharacter = (c: SearchCharacter) => {
    navigate({ c: normalizeCharacterId(c.characterId), s: String(c.serverId), q: query })
  }

  const isHome = !query && !characterId
  const showBack = !isHome

  return (
    <div className="min-h-dvh">
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[520px] flex-col bg-background shadow-[0_0_80px_rgba(0,0,0,0.55)]">
        <header className="sticky top-0 z-30 flex h-[58px] items-center gap-2 border-b border-border/60 bg-background/85 px-3 backdrop-blur-md">
          {showBack ? (
            <button
              type="button"
              onClick={() => window.history.back()}
              aria-label="뒤로"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[17px] transition-colors active:bg-accent"
            >
              ←
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(null)}
              aria-label="홈"
              className="flex h-9 w-9 shrink-0 items-center justify-center text-[19px]"
            >
              🔮
            </button>
          )}

          <form
            className="relative flex-1"
            onSubmit={(e) => {
              e.preventDefault()
              submit(draft)
              ;(document.activeElement as HTMLElement | null)?.blur()
            }}
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="서버 닉네임 또는 닉네임"
              enterKeyHint="search"
              autoComplete="off"
              className="h-10 rounded-full bg-secondary/60 pl-4 pr-10 text-[14px]"
            />
            <button
              type="submit"
              aria-label="검색"
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[15px] transition-colors active:bg-accent"
            >
              🔍
            </button>
          </form>
        </header>

        <main className="flex-1 safe-bottom">
          {serverError ? (
            <EmptyState
              emoji="🚨"
              title="서버 목록을 못 불러왔어요"
              desc="잠시 후 다시 시도해 주세요"
            />
          ) : characterId && serverId ? (
            <CharacterView characterId={characterId} serverId={serverId} />
          ) : query ? (
            <SearchView query={query} servers={servers} onPick={pickCharacter} />
          ) : (
            <HomeView
              servers={servers}
              recents={recents}
              onPickRecent={(q) => {
                setDraft(q)
                submit(q)
              }}
              onPickServer={(name) => setDraft((d) => `${name} ${stripKnownServer(d, servers)}`.trim())}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
