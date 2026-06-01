import { NextRequest } from 'next/server'

const BASE = 'https://api.odcloud.kr/api'
const KEY = process.env.PUBLIC_DATA_API_KEY!

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const month = sp.get('month') ?? ''

  const params = new URLSearchParams({
    serviceKey: KEY,
    page: '1',
    perPage: '500',
    returnType: 'JSON',
  })
  if (month) {
    params.set('cond[STAT_DE::GTE]', month)
    params.set('cond[STAT_DE::LTE]', month)
  }

  const url = `${BASE}/ApplyhomeStatSvc/v1/getAPTCmpetrtAreaStat?${params}`
  const res = await fetch(url, { next: { revalidate: 600 } })
  const data = await res.json()
  return Response.json(data)
}
