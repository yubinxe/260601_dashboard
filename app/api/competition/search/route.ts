import { NextRequest } from 'next/server'

const BASE = 'https://api.odcloud.kr/api'
const KEY = process.env.PUBLIC_DATA_API_KEY!

export async function GET(req: NextRequest) {
  const pblancNo = req.nextUrl.searchParams.get('pblancNo') ?? ''

  const params = new URLSearchParams({
    serviceKey: KEY,
    page: '1',
    perPage: '50',
    returnType: 'JSON',
  })
  if (pblancNo) params.set('cond[PBLANC_NO::EQ]', pblancNo)

  const url = `${BASE}/ApplyhomeInfoCmpetRtSvc/v1/getAPTLttotPblancCmpet?${params}`
  const res = await fetch(url, { next: { revalidate: 60 } })
  const data = await res.json()
  return Response.json(data)
}
