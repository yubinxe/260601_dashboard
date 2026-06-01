/** SVG viewBox 줌·팬 계산 */

export interface MapView {
  x: number
  y: number
  w: number
  h: number
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

export function lerpView(a: MapView, b: MapView, t: number): MapView {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    w: a.w + (b.w - a.w) * t,
    h: a.h + (b.h - a.h) * t,
  }
}

export function viewBoxString(v: MapView): string {
  return `${v.x} ${v.y} ${v.w} ${v.h}`
}

export function regionFocusView(
  bbox: { x: number; y: number; width: number; height: number },
  full: MapView,
  padding = 0.2,
): MapView {
  const pad = Math.max(bbox.width, bbox.height) * padding
  const w = bbox.width + pad * 2
  const h = bbox.height + pad * 2
  return clampView(
    { x: bbox.x - pad, y: bbox.y - pad, w, h },
    full,
    full.w / 12,
  )
}

export function zoomAtPoint(
  view: MapView,
  factor: number,
  fx: number,
  fy: number,
  full: MapView,
  minW: number,
): MapView {
  const nextW = view.w * factor
  const clampedW = Math.min(full.w, Math.max(minW, nextW))
  const scale = clampedW / view.w
  const nextH = view.h * scale
  const rx = (fx - view.x) / view.w
  const ry = (fy - view.y) / view.h
  return clampView(
    {
      x: fx - rx * clampedW,
      y: fy - ry * nextH,
      w: clampedW,
      h: nextH,
    },
    full,
    minW,
  )
}

export function panView(view: MapView, dx: number, dy: number, full: MapView, minW: number): MapView {
  return clampView(
    { x: view.x + dx, y: view.y + dy, w: view.w, h: view.h },
    full,
    minW,
  )
}

function clampView(view: MapView, full: MapView, minW: number): MapView {
  const w = Math.min(full.w, Math.max(minW, view.w))
  const h = view.h * (w / view.w)
  let x = view.x
  let y = view.y

  const marginX = w * 0.08
  const marginY = h * 0.08
  const minX = full.x - marginX
  const maxX = full.x + full.w - w + marginX
  const minY = full.y - marginY
  const maxY = full.y + full.h - h + marginY

  if (maxX >= minX) x = Math.min(maxX, Math.max(minX, x))
  else x = full.x + (full.w - w) / 2

  if (maxY >= minY) y = Math.min(maxY, Math.max(minY, y))
  else y = full.y + (full.h - h) / 2

  return { x, y, w, h }
}
