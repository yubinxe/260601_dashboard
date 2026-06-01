import { KOREA_PROVINCES, REGION_CENTROID_BY_CODE } from '@/lib/korea-map-data'

/** 시·도 청약 지역 코드 ↔ 지도 좌표 (@svg-maps/south-korea 기준) */

export interface RegionGeo {
  code: string
  name: string
  x: number
  y: number
}

const REGION_NAMES: Record<string, string> = {
  '100': '서울',
  '200': '강원',
  '300': '대전',
  '312': '충남',
  '338': '세종',
  '360': '충북',
  '400': '인천',
  '410': '경기',
  '500': '광주',
  '513': '전남',
  '560': '전북',
  '600': '부산',
  '621': '경남',
  '680': '울산',
  '690': '제주',
  '700': '대구',
  '712': '경북',
}

export const KOREA_REGIONS: RegionGeo[] = KOREA_PROVINCES.map(p => {
  const c = REGION_CENTROID_BY_CODE[p.code] ?? { x: 262, y: 316 }
  return {
    code: p.code,
    name: REGION_NAMES[p.code] ?? p.name,
    x: Math.round(c.x),
    y: Math.round(c.y),
  }
})

export const REGION_BY_CODE = Object.fromEntries(KOREA_REGIONS.map(r => [r.code, r]))

export function offsetMarkerPosition(
  baseX: number,
  baseY: number,
  index: number,
  total: number,
): { x: number; y: number } {
  if (total <= 1) return { x: baseX, y: baseY }
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2
  const radius = 14 + Math.min(total, 6) * 2
  return {
    x: baseX + Math.cos(angle) * radius,
    y: baseY + Math.sin(angle) * radius,
  }
}

export function heatLevel(rate: number): 0 | 1 | 2 | 3 | 4 {
  if (rate >= 40) return 4
  if (rate >= 15) return 3
  if (rate >= 5) return 2
  if (rate >= 1.5) return 1
  return 0
}

export function heatColor(level: 0 | 1 | 2 | 3 | 4): string {
  const colors = [
    'color-mix(in oklch, var(--ink) 6%, var(--surface))',
    'color-mix(in oklch, var(--warn) 28%, var(--surface))',
    'color-mix(in oklch, var(--warn) 48%, var(--surface))',
    'color-mix(in oklch, var(--hot) 58%, var(--surface))',
    'color-mix(in oklch, var(--hot) 78%, var(--surface))',
  ]
  return colors[level]
}
