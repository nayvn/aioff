import type {
  CharacterInfo,
  DaevanionDetail,
  EquipmentResponse,
  ItemDetail,
  SearchCharacter,
  SearchResponse,
  ServerInfo,
} from './aion2'

const BASE = '/api/aion2'

const cache = new Map<string, Promise<unknown>>()

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function buildUrl(path: string, params: Record<string, string | number | undefined>) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === '') continue
    qs.set(k, String(v))
  }
  return `${BASE}/${path}?${qs.toString()}`
}

async function get<T>(
  path: string,
  params: Record<string, string | number | undefined>,
): Promise<T> {
  const url = buildUrl(path, params)
  const hit = cache.get(url)
  if (hit) return hit as Promise<T>

  const p = (async () => {
    const res = await fetch(url, { headers: { accept: 'application/json' } })
    if (!res.ok) {
      cache.delete(url)
      if (res.status === 404) throw new ApiError(404, '정보를 찾을 수 없어요.')
      throw new ApiError(res.status, `요청에 실패했어요. (${res.status})`)
    }
    return res.json()
  })()

  cache.set(url, p)
  return p as Promise<T>
}

/**
 * 검색 결과의 characterId 는 이미 URL 인코딩된 상태(`...%3D`)로 내려온다.
 * URLSearchParams 로 다시 인코딩하면 `%253D` 가 되어 404 가 나므로 한 번 디코딩해서 보관한다.
 */
export function normalizeCharacterId(id: string) {
  try {
    return decodeURIComponent(id)
  } catch {
    return id
  }
}

export function getServers() {
  return get<{ serverList: ServerInfo[] }>('gameinfo/servers', { lang: 'ko' }).then(
    (d) => d.serverList,
  )
}

export interface ParsedQuery {
  keyword: string
  server?: ServerInfo
}

/**
 * "지켈 아무개" / "아무개" 처럼 입력 하나로 서버 + 닉네임을 받는다.
 * 앞뒤 어느 쪽에 서버명이 붙어도 인식한다.
 */
export function parseQuery(raw: string, servers: ServerInfo[]): ParsedQuery {
  const input = raw.trim().replace(/\s+/g, ' ')
  if (!input) return { keyword: '' }

  const matchServer = (token: string) =>
    servers.find((s) => s.serverName === token || s.serverShortName === token)

  const tokens = input.split(' ')
  if (tokens.length >= 2) {
    const head = matchServer(tokens[0])
    if (head) return { server: head, keyword: tokens.slice(1).join(' ') }
    const tail = matchServer(tokens[tokens.length - 1])
    if (tail) return { server: tail, keyword: tokens.slice(0, -1).join(' ') }
  }

  // 붙여 쓴 경우("지켈아무개")도 서버명 접두사로 인식
  const glued = servers.find(
    (s) =>
      (input.startsWith(s.serverName) && input.length > s.serverName.length) ||
      (input.startsWith(s.serverShortName) && input.length > s.serverShortName.length),
  )
  if (glued) {
    const prefix = input.startsWith(glued.serverName) ? glued.serverName : glued.serverShortName
    return { server: glued, keyword: input.slice(prefix.length).trim() }
  }

  return { keyword: input }
}

async function searchOne(keyword: string, race: number, serverId?: number) {
  const data = await get<SearchResponse>('search/character', {
    keyword,
    race,
    serverId,
    sort: 'desc',
    page: 1,
    size: 40,
    lang: 'ko',
  })
  return data.list ?? []
}

/** race 는 필수 파라미터라, 종족을 모를 때는 천족/마족을 동시에 조회해서 합친다. */
export async function searchCharacters(parsed: ParsedQuery): Promise<SearchCharacter[]> {
  const { keyword, server } = parsed
  if (!keyword) return []

  const races = server ? [server.raceId] : [1, 2]
  const results = await Promise.all(
    races.map((race) =>
      searchOne(keyword, race, server?.serverId).catch(() => [] as SearchCharacter[]),
    ),
  )

  const merged = results.flat()
  // 정확히 일치하는 닉네임을 위로, 그다음 레벨 높은 순
  const exact = keyword.toLowerCase()
  return merged.sort((a, b) => {
    const ae = a.name.replace(/<[^>]*>/g, '').toLowerCase() === exact ? 0 : 1
    const be = b.name.replace(/<[^>]*>/g, '').toLowerCase() === exact ? 0 : 1
    if (ae !== be) return ae - be
    return b.level - a.level
  })
}

export function getCharacterInfo(characterId: string, serverId: number) {
  return get<CharacterInfo>('character/info', { lang: 'ko', characterId, serverId })
}

export function getEquipment(characterId: string, serverId: number) {
  return get<EquipmentResponse>('character/equipment', { lang: 'ko', characterId, serverId })
}

export function getItemDetail(args: {
  id: number
  enchantLevel: number
  characterId: string
  serverId: number
  slotPos: number
}) {
  return get<ItemDetail | { data: ItemDetail }>('character/equipment/item', {
    lang: 'ko',
    id: args.id,
    enchantLevel: args.enchantLevel,
    characterId: args.characterId,
    serverId: args.serverId,
    slotPos: args.slotPos,
  }).then((d) => ('data' in d ? d.data : d) as ItemDetail)
}

export function getDaevanionDetail(characterId: string, serverId: number, boardId: number) {
  return get<DaevanionDetail>('character/daevanion/detail', {
    lang: 'ko',
    characterId,
    serverId,
    boardId,
  })
}
