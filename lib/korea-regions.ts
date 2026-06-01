/** SVG viewBox 0 0 400 480 — 시·도 청약 지역 코드 ↔ 지도 좌표 */

export interface RegionGeo {
  code: string
  name: string
  x: number
  y: number
}

export const KOREA_VIEWBOX = { w: 400, h: 480 }

export const KOREA_REGIONS: RegionGeo[] = [
  { code: '200', name: '강원', x: 252, y: 112 },
  { code: '100', name: '서울', x: 172, y: 156 },
  { code: '410', name: '경기', x: 158, y: 172 },
  { code: '400', name: '인천', x: 138, y: 166 },
  { code: '360', name: '충북', x: 200, y: 198 },
  { code: '338', name: '세종', x: 182, y: 212 },
  { code: '312', name: '충남', x: 158, y: 228 },
  { code: '300', name: '대전', x: 192, y: 238 },
  { code: '712', name: '경북', x: 248, y: 224 },
  { code: '700', name: '대구', x: 238, y: 264 },
  { code: '680', name: '울산', x: 272, y: 276 },
  { code: '621', name: '경남', x: 218, y: 288 },
  { code: '600', name: '부산', x: 262, y: 302 },
  { code: '560', name: '전북', x: 168, y: 276 },
  { code: '500', name: '광주', x: 152, y: 308 },
  { code: '513', name: '전남', x: 158, y: 338 },
  { code: '690', name: '제주', x: 172, y: 418 },
]

export const REGION_BY_CODE = Object.fromEntries(KOREA_REGIONS.map(r => [r.code, r]))

/** 대한민국 실루엣 (스타일라이즈드) */
export const KOREA_OUTLINE =
  'M 175 88 C 210 82 248 98 268 128 C 288 148 298 178 292 210 ' +
  'C 298 240 288 272 272 300 C 268 328 252 352 228 368 C 210 382 188 392 172 408 ' +
  'C 158 398 148 378 142 352 C 128 328 118 298 120 268 C 108 248 102 218 108 188 ' +
  'C 112 158 128 132 152 112 C 162 100 168 92 175 88 Z'

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
    'color-mix(in oklch, var(--ink) 8%, transparent)',
    'color-mix(in oklch, var(--warn) 25%, transparent)',
    'color-mix(in oklch, var(--warn) 45%, transparent)',
    'color-mix(in oklch, var(--hot) 55%, transparent)',
    'color-mix(in oklch, var(--hot) 75%, transparent)',
  ]
  return colors[level]
}
