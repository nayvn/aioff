import { useEffect, useState } from 'react'
import { parseQuery, searchCharacters } from '@/lib/api'
import type { SearchCharacter, ServerInfo } from '@/lib/aion2'
import { RACE_EMOJI, profileImageSrc, stripTags } from '@/lib/aion2'
import { EmptyState, Panel } from '@/components/common'
import { Skeleton } from '@/components/ui/skeleton'

export function SearchView({
  query,
  servers,
  onPick,
}: {
  query: string
  servers: ServerInfo[]
  onPick: (c: SearchCharacter) => void
}) {
  const [list, setList] = useState<SearchCharacter[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const parsed = parseQuery(query, servers)

  useEffect(() => {
    if (!query.trim()) {
      setList(null)
      return
    }
    let alive = true
    setList(null)
    setError(null)
    searchCharacters(parseQuery(query, servers))
      .then((r) => alive && setList(r))
      .catch((e: Error) => alive && setError(e.message))
    return () => {
      alive = false
    }
    // servers 는 최초 1회 로드 후 변하지 않는다
  }, [query, servers])

  if (error) return <EmptyState emoji="🚨" title="검색에 실패했어요" desc={error} />

  if (!list) {
    return (
      <div className="flex flex-col gap-2 px-4 pt-4">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[68px] w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <EmptyState
        emoji="👻"
        title="찾는 캐릭터가 없어요"
        desc={
          parsed.server
            ? `${parsed.server.serverName} 서버에서 "${parsed.keyword}" 를 못 찾았어요`
            : '닉네임을 정확히 입력했는지 확인해 주세요'
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-2 px-4 pt-4">
      <p className="px-1 text-[12px] text-muted-foreground">
        {parsed.server ? `${parsed.server.serverName} · ` : '전체 서버 · '}
        {list.length}명
      </p>
      {list.map((c) => (
        <button
          key={`${c.serverId}-${c.characterId}`}
          type="button"
          onClick={() => onPick(c)}
          className="text-left"
        >
          <Panel className="flex items-center gap-3 transition-colors active:bg-accent/50">
            <img
              src={profileImageSrc(c.profileImageUrl)}
              alt=""
              className="h-11 w-11 shrink-0 rounded-xl bg-black/40 object-cover ring-1 ring-white/10"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] font-semibold">{stripTags(c.name)}</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                {RACE_EMOJI[c.race]} {c.serverName} · Lv.{c.level}
              </p>
            </div>
            <span className="text-xs text-muted-foreground" aria-hidden>
              ›
            </span>
          </Panel>
        </button>
      ))}
    </div>
  )
}

export function HomeView({
  servers,
  recents,
  onPickRecent,
  onPickServer,
}: {
  servers: ServerInfo[]
  recents: string[]
  onPickRecent: (q: string) => void
  onPickServer: (name: string) => void
}) {
  const elyos = servers.filter((s) => s.raceId === 1)
  const asmo = servers.filter((s) => s.raceId === 2)

  return (
    <div className="flex flex-col gap-7 px-4 pt-6">
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <span className="text-5xl" aria-hidden>
          🔮
        </span>
        <h1 className="text-[19px] font-bold tracking-tight">아이온2 캐릭터 조회</h1>
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          닉네임만 입력하거나
          <br />
          <span className="text-foreground">서버 닉네임</span> 형태로 검색해 보세요
        </p>
      </div>

      {recents.length ? (
        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-[13px] font-semibold">🕘 최근 검색</h2>
          <div className="flex flex-wrap gap-1.5">
            {recents.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onPickRecent(r)}
                className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-[12.5px] transition-colors active:bg-accent/50"
              >
                {r}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <ServerGroup emoji="🕊️" title="천족 서버" servers={elyos} onPick={onPickServer} />
      <ServerGroup emoji="🦇" title="마족 서버" servers={asmo} onPick={onPickServer} />

      <p className="pb-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        💡 데이터 출처: 아이온2 공식 캐릭터 정보실
      </p>
    </div>
  )
}

function ServerGroup({
  emoji,
  title,
  servers,
  onPick,
}: {
  emoji: string
  title: string
  servers: ServerInfo[]
  onPick: (name: string) => void
}) {
  if (!servers.length) return null
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-[13px] font-semibold">
        <span aria-hidden>{emoji}</span> {title}
      </h2>
      <div className="flex flex-wrap gap-1.5">
        {servers.map((s) => (
          <button
            key={s.serverId}
            type="button"
            onClick={() => onPick(s.serverName)}
            className="rounded-full border border-border/70 bg-card px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors active:bg-accent/50"
          >
            {s.serverName}
          </button>
        ))}
      </div>
    </section>
  )
}
