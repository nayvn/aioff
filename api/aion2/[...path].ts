// 배포용 프록시 (Vercel Serverless Function).
// 로컬 개발에서는 vite.config.ts 의 server.proxy 가 같은 경로를 처리하므로 이 파일은 쓰이지 않는다.
// /api/aion2/<path>?<query>  ->  https://aion2.plaync.com/api/<path>?<query>

const AION2_ORIGIN = 'https://aion2.plaync.com'

const ALLOWED = [
  'gameinfo/servers',
  'gameinfo/classes',
  'gameinfo/pcdata',
  'search/character',
  'character/info',
  'character/equipment',
  'character/equipment/item',
  'character/daevanion/detail',
]

export const config = { runtime: 'edge' }

export default async function handler(req: Request) {
  const url = new URL(req.url)
  const path = url.pathname.replace(/^\/api\/aion2\/?/, '')

  if (!ALLOWED.includes(path)) {
    return new Response(JSON.stringify({ error: 'not allowed', path }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    })
  }

  const target = `${AION2_ORIGIN}/api/${path}${url.search}`
  const upstream = await fetch(target, {
    headers: {
      accept: 'application/json',
      referer: `${AION2_ORIGIN}/ko-kr/characters/index`,
      'user-agent': req.headers.get('user-agent') ?? 'Mozilla/5.0',
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
