// Cloudflare Pages Function — 배포 환경의 API 중계.
// 로컬 개발에서는 vite.config.ts 의 server.proxy 가 같은 경로를 처리하므로 이 파일은 쓰이지 않는다.
// /api/aion2/<path>?<query>  ->  https://aion2.plaync.com/api/<path>?<query>

const AION2_ORIGIN = 'https://aion2.plaync.com'

// 이 앱이 실제로 쓰는 경로만 통과시킨다 (오픈 프록시가 되지 않도록)
const ALLOWED = new Set([
  'gameinfo/servers',
  'gameinfo/classes',
  'gameinfo/pcdata',
  'search/character',
  'character/info',
  'character/equipment',
  'character/equipment/item',
  'character/daevanion/detail',
])

interface PagesContext {
  request: Request
  params: { path?: string | string[] }
}

export const onRequestGet = async (context: PagesContext): Promise<Response> => {
  const { request, params } = context
  const raw = params.path
  const path = Array.isArray(raw) ? raw.join('/') : (raw ?? '')

  if (!ALLOWED.has(path)) {
    return new Response(JSON.stringify({ error: 'not allowed', path }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    })
  }

  const search = new URL(request.url).search
  const upstream = await fetch(`${AION2_ORIGIN}/api/${path}${search}`, {
    headers: {
      accept: 'application/json',
      referer: `${AION2_ORIGIN}/ko-kr/characters/index`,
      'user-agent': request.headers.get('user-agent') ?? 'Mozilla/5.0',
    },
  })

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
      // 같은 응답을 반복 조회하는 일이 잦아 짧게 캐싱한다.
      'cache-control': 'public, max-age=60, s-maxage=60',
    },
  })
}
