import mapData from '@svg-maps/south-korea'
import { svgPathBbox } from 'svg-path-bbox'

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

const MAP_FALLBACK = { x: 262, y: 316, width: 524, height: 631 }

/** SVG path의 실제 바운딩 박스 (마커·라벨용) */
export function pathBBox(path: string): { x: number; y: number; width: number; height: number } {
  try {
    const [minX, minY, maxX, maxY] = svgPathBbox(path)
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
  } catch {
    return { ...MAP_FALLBACK }
  }
}

export function pathBBoxCenter(path: string): { x: number; y: number } {
  const b = pathBBox(path)
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
}

export const REGION_BBOX_BY_CODE = Object.fromEntries(
  KOREA_PROVINCES.map(p => [p.code, pathBBox(p.path)]),
)

export const REGION_CENTROID_BY_CODE = Object.fromEntries(
  KOREA_PROVINCES.map(p => [p.code, pathBBoxCenter(p.path)]),
)
