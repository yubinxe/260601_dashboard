/** 시·도 path bbox 안에서 단지 마커를 퍼뜨리는 레이아웃 */

export interface MapBBox {
  x: number
  y: number
  width: number
  height: number
}

export function layoutHotspotInRegion(
  bbox: MapBBox,
  index: number,
  total: number,
): { x: number; y: number } {
  const cx = bbox.x + bbox.width / 2
  const cy = bbox.y + bbox.height / 2
  const maxR = Math.min(bbox.width, bbox.height) * 0.28

  if (total <= 1) {
    return { x: Math.round(cx), y: Math.round(cy) }
  }

  const angle = (index / total) * Math.PI * 2 - Math.PI / 2
  const ring = Math.floor(index / 8)
  const r = Math.min(maxR, 6 + ring * 5 + (index % 8) * 1.2)
  let x = cx + Math.cos(angle) * r
  let y = cy + Math.sin(angle) * r

  const pad = 6
  x = Math.max(bbox.x + pad, Math.min(bbox.x + bbox.width - pad, x))
  y = Math.max(bbox.y + pad, Math.min(bbox.y + bbox.height - pad, y))

  return { x: Math.round(x), y: Math.round(y) }
}
