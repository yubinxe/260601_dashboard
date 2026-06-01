import type {
  AnnouncementsResponse,
  CompetitionItem,
  SpecialSupplyItem,
  AgeStatItem,
  AreaStatItem,
  CompetitionStatItem,
  ScoreStatItem,
  OdcloudResponse,
} from './types'

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => v && url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// ── 분양정보 ─────────────────────────────────────────────
export function fetchAnnouncements(params: {
  page?: number
  perPage?: number
  region?: string
  dateFrom?: string
  dateTo?: string
  houseName?: string
  houseType?: string
}) {
  return get<AnnouncementsResponse>('/api/announcements', {
    page: String(params.page ?? 1),
    perPage: String(params.perPage ?? 15),
    region: params.region ?? '',
    dateFrom: params.dateFrom ?? '',
    dateTo: params.dateTo ?? '',
    houseName: params.houseName ?? '',
    houseType: params.houseType ?? '',
  })
}

// ── 경쟁률 통계 (지역별) ──────────────────────────────────
export function fetchCompetitionStats(params: { month?: string }) {
  return get<OdcloudResponse<CompetitionStatItem>>('/api/competition/stats', {
    month: params.month ?? '',
  })
}

// ── 경쟁률 상세 (단지 검색) ──────────────────────────────
export function fetchCompetitionSearch(params: { pblancNo: string }) {
  return get<OdcloudResponse<CompetitionItem>>('/api/competition/search', {
    pblancNo: params.pblancNo,
  })
}

// ── 특별공급 현황 ─────────────────────────────────────────
export function fetchSpecialSupply(params: { pblancNo: string }) {
  return get<OdcloudResponse<SpecialSupplyItem>>('/api/competition/special', {
    pblancNo: params.pblancNo,
  })
}

// ── 연령별 통계 ───────────────────────────────────────────
export function fetchWinnersAge(params: { monthFrom?: string; monthTo?: string }) {
  return get<{ applicants: AgeStatItem[]; winners: AgeStatItem[] }>('/api/winners/age', {
    monthFrom: params.monthFrom ?? '',
    monthTo: params.monthTo ?? '',
  })
}

// ── 지역별 통계 ───────────────────────────────────────────
export function fetchWinnersRegion(params: { month?: string }) {
  return get<{ applicants: AreaStatItem[]; winners: AreaStatItem[] }>('/api/winners/region', {
    month: params.month ?? '',
  })
}

// ── 가점 통계 ─────────────────────────────────────────────
export function fetchWinnersScore(params: { month?: string; region?: string }) {
  return get<OdcloudResponse<ScoreStatItem>>('/api/winners/score', {
    month: params.month ?? '',
    region: params.region ?? '',
  })
}

// ── 핫플레이스 지도 ───────────────────────────────────────
export function fetchHotmap(params: { month?: string } = {}) {
  return get<import('./hotmap-types').HotmapPayload>('/api/hotmap', {
    month: params.month ?? '',
  })
}
