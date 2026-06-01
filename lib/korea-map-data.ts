import mapData from '@svg-maps/south-korea'

interface SvgMapLocation {
  id: string
  name: string
  path: string
}

interface SvgMap {
  viewBox: string
  locations: SvgMapLocation[]
}

const southKoreaMap = mapData as SvgMap

/** @svg-maps id → 청약 API 지역 코드 */
export const SVG_ID_TO_REGION_CODE: Record<string, string> = {
  seoul: '100',
  busan: '600',
  daegu: '700',
  incheon: '400',
  gwangju: '500',
  daejeon: '300',
  ulsan: '680',
  sejong: '338',
  gyeonggi: '410',
  gangwon: '200',
  'north-chungcheong': '360',
  'south-chungcheong': '312',
  'north-gyeongsang': '712',
  'south-gyeongsang': '621',
  'north-jeolla': '560',
  'south-jeolla': '513',
  jeju: '690',
}

export const KOREA_MAP_VIEWBOX = southKoreaMap.viewBox

export interface KoreaProvincePath {
  id: string
  name: string
  path: string
  code: string
}

export const KOREA_PROVINCES: KoreaProvincePath[] = southKoreaMap.locations.map((loc: SvgMapLocation) => ({
  id: loc.id,
  name: loc.name,
  path: loc.path,
  code: SVG_ID_TO_REGION_CODE[loc.id] ?? loc.id,
}))

/** 경로 좌표의 바운딩 박스 중심 (마커·라벨용) */
export function pathBBoxCenter(path: string): { x: number; y: number } {
  const nums = path.match(/-?\d*\.?\d+/g)?.map(Number).filter(n => Number.isFinite(n)) ?? []
  if (nums.length < 4) return { x: 262, y: 316 }

  const xs: number[] = []
  const ys: number[] = []
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = nums[i]
    const y = nums[i + 1]
    if (x >= 0 && x <= 600 && y >= 0 && y <= 700) {
      xs.push(x)
      ys.push(y)
    }
  }
  if (xs.length === 0) return { x: 262, y: 316 }
  return {
    x: (Math.min(...xs) + Math.max(...xs)) / 2,
    y: (Math.min(...ys) + Math.max(...ys)) / 2,
  }
}

export const REGION_CENTROID_BY_CODE = Object.fromEntries(
  KOREA_PROVINCES.map(p => [p.code, pathBBoxCenter(p.path)]),
)
