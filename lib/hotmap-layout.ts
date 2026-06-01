import { REGION_BBOX_BY_CODE } from '@/lib/korea-map-data'
import type { HotmapSpot } from '@/lib/hotmap-types'

/** 시·도 path bbox 안에서 단지 마커를 퍼뜨리는 레이아웃 */

export interface MapBBox {
  x: number
  y: number
  width: number
  height: number
}

const GOLDEN = Math.PI * (3 - Math.sqrt(5))

export function layoutHotspotInRegion(
  bbox: MapBBox,
  index: number,
  total: number,
): { x: number; y: number } {
  const cx = bbox.x + bbox.width / 2
  const cy = bbox.y + bbox.height / 2
  const pad = Math.max(8, Math.min(bbox.width, bbox.height) * 0.12)
  const maxR = Math.min(bbox.width, bbox.height) * 0.32 - pad

  if (total <= 1) {
    return { x: round(cx), y: round(cy) }
  }

  const angle = index * GOLDEN - Math.PI / 2
  const t = (index + 1) / (total + 1)
  const r = maxR * Math.sqrt(t)
  let x = cx + Math.cos(angle) * r
  let y = cy + Math.sin(angle) * r

  x = Math.max(bbox.x + pad, Math.min(bbox.x + bbox.width - pad, x))
  y = Math.max(bbox.y + pad, Math.min(bbox.y + bbox.height - pad, y))

  return { x: round(x), y: round(y) }
}

function round(n: number) {
  return Math.round(n * 10) / 10
}

/** ID 기준 고정 순서로 마커 좌표 생성 (호버·필터와 무관하게 동일) */
export function buildStableMarkerPositions(
  hotspots: HotmapSpot[],
): Map<string, { x: number; y: number }> {
  const byRegion = new Map<string, HotmapSpot[]>()

  hotspots.forEach(spot => {
    const list = byRegion.get(spot.regionCode) ?? []
    list.push(spot)
    byRegion.set(spot.regionCode, list)
  })

  const positions = new Map<string, { x: number; y: number }>()

  byRegion.forEach((spots, code) => {
    const bbox = REGION_BBOX_BY_CODE[code]
    if (!bbox) return

    const sorted = [...spots].sort((a, b) => a.id.localeCompare(b.id))
    sorted.forEach((spot, index) => {
      positions.set(spot.id, layoutHotspotInRegion(bbox, index, sorted.length))
    })
  })

  return positions
}
