/** 민영·국민 일반공급 가점제 기준 (최대 84점) */

export interface ScoreInput {
  /** 무주택 기간 (년) */
  homelessYears: number
  /** 부양가족 수 (본인 제외, 0~6명) */
  dependents: number
  /** 청약통장 가입 기간 (년) */
  accountYears: number
}

export interface ScoreBreakdown {
  homeless: number
  dependents: number
  account: number
  total: number
}

export interface ReferenceStats {
  avg: number
  min: number
  max: number
  median: number
  regionName: string
  statMonth: string
  sampleCount: number
}

export type PredictionLevel = 'high' | 'medium' | 'low'

export interface PredictionResult {
  probability: number
  level: PredictionLevel
  headline: string
  insight: string
  detail: string
  breakdown: ScoreBreakdown
  reference: ReferenceStats
}

export const SCORE_LIMITS = {
  homelessYearsMax: 16,
  dependentsMax: 6,
  accountYearsMax: 17,
} as const

export function clampHomelessYears(years: number) {
  return Math.min(SCORE_LIMITS.homelessYearsMax, Math.max(0, Math.floor(years)))
}

export function clampDependents(n: number) {
  return Math.min(SCORE_LIMITS.dependentsMax, Math.max(0, Math.floor(n)))
}

export function clampAccountYears(years: number) {
  return Math.min(SCORE_LIMITS.accountYearsMax, Math.max(0, Math.floor(years)))
}

export function calculateSubscriptionScore(input: ScoreInput): ScoreBreakdown {
  const homeless = Math.min(Math.max(0, Math.floor(input.homelessYears)) * 2, 32)
  const dependents = Math.min(Math.max(0, Math.floor(input.dependents)) * 5, 35)
  const account = Math.min(Math.max(0, Math.floor(input.accountYears)), 17)
  return { homeless, dependents, account, total: homeless + dependents + account }
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function predictWinProbability(
  userScore: number,
  ref: ReferenceStats,
  complexName?: string,
): PredictionResult {
  const spread = Math.max(ref.max - ref.min, 8)
  const avgDiff = userScore - ref.avg
  const cutlineGap = userScore - ref.min

  let probability =
    18 +
    ((userScore - ref.min) / spread) * 52 +
    (avgDiff > 0 ? Math.min(avgDiff * 2.2, 18) : Math.max(avgDiff * 2.5, -22))

  if (userScore >= ref.max - 1) probability = Math.max(probability, 86)
  if (userScore >= ref.avg + 5) probability = Math.max(probability, 68)
  if (userScore < ref.min - 3) probability = Math.min(probability, 12)
  if (userScore < ref.avg - 8) probability = Math.min(probability, 22)

  probability = Math.round(clamp(probability, 5, 94))

  const level: PredictionLevel =
    probability >= 62 ? 'high' : probability >= 38 ? 'medium' : 'low'

  const target = complexName ? `「${complexName}」` : `최근 ${ref.regionName} 당첨 데이터`
  const absDiff = Math.abs(Math.round(avgDiff * 10) / 10)

  let insight: string
  if (avgDiff > 0.5) {
    insight = `${target} 기준, 당신의 가점은 최근 평균 당첨 가점(${ref.avg.toFixed(1)}점)보다 ${absDiff}점 높습니다.`
  } else if (avgDiff < -0.5) {
    insight = `${target} 기준, 최근 평균 당첨 가점이 당신보다 ${absDiff}점 높습니다.`
  } else {
    insight = `${target} 기준, 당신의 가점은 최근 평균 당첨 가점과 비슷한 수준입니다.`
  }

  let detail: string
  if (cutlineGap >= 5) {
    detail = `최근 커트라인(최저 당첨) ${ref.min.toFixed(1)}점 대비 ${cutlineGap.toFixed(1)}점 여유가 있어 상대적으로 유리한 편입니다.`
  } else if (cutlineGap >= 0) {
    detail = `최근 커트라인 ${ref.min.toFixed(1)}점 근처입니다. 경쟁률·면적에 따라 결과가 달라질 수 있습니다.`
  } else {
    detail = `최근 커트라인 ${ref.min.toFixed(1)}점보다 ${Math.abs(cutlineGap).toFixed(1)}점 낮습니다. 특별공급·잔여세대 등 다른 경로도 검토해 보세요.`
  }

  const headlines: Record<PredictionLevel, string> = {
    high: '당첨 가능성이 높은 구간입니다',
    medium: '평균 수준 — 조건에 따라 달라집니다',
    low: '가점 보완 또는 대안 검토를 권장합니다',
  }

  return {
    probability,
    level,
    headline: headlines[level],
    insight,
    detail,
    breakdown: { homeless: 0, dependents: 0, account: 0, total: userScore },
    reference: ref,
  }
}

export function buildPrediction(
  input: ScoreInput,
  ref: ReferenceStats,
  complexName?: string,
): PredictionResult {
  const breakdown = calculateSubscriptionScore(input)
  const result = predictWinProbability(breakdown.total, ref, complexName)
  return { ...result, breakdown }
}

export function aggregateReferenceStats(
  rows: { AVRG_SCORE: string; LWET_SCORE: string; TOP_SCORE: string; MED_SCORE?: string; SUBSCRPT_AREA_CODE_NM?: string; STAT_DE?: string }[],
  regionName: string,
): ReferenceStats | null {
  if (rows.length === 0) return null

  const avgs = rows.map(r => parseFloat(r.AVRG_SCORE)).filter(Number.isFinite)
  const mins = rows.map(r => parseFloat(r.LWET_SCORE)).filter(Number.isFinite)
  const maxs = rows.map(r => parseFloat(r.TOP_SCORE)).filter(Number.isFinite)
  const meds = rows.map(r => parseFloat(r.MED_SCORE || r.AVRG_SCORE)).filter(Number.isFinite)

  if (avgs.length === 0) return null

  const avg = avgs.reduce((a, b) => a + b, 0) / avgs.length
  const min = mins.length ? Math.min(...mins) : avg - 8
  const max = maxs.length ? Math.max(...maxs) : avg + 8
  const median = meds.length ? meds.reduce((a, b) => a + b, 0) / meds.length : avg
  const months = rows.map(r => r.STAT_DE).filter(Boolean) as string[]
  const statMonth = months.sort().reverse()[0] ?? ''

  return {
    avg: Math.round(avg * 10) / 10,
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    median: Math.round(median * 10) / 10,
    regionName,
    statMonth,
    sampleCount: rows.length,
  }
}

/** API 데이터 없을 때 사용하는 보수적 기본값 */
export const DEFAULT_REFERENCE: ReferenceStats = {
  avg: 58.2,
  min: 52.0,
  max: 78.0,
  median: 57.5,
  regionName: '전국',
  statMonth: '',
  sampleCount: 0,
}
