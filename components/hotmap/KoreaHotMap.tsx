'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import {
  KOREA_MAP_VIEWBOX,
  KOREA_PROVINCES,
  REGION_BBOX_BY_CODE,
  REGION_CENTROID_BY_CODE,
} from '@/lib/korea-map-data'
import { layoutHotspotInRegion } from '@/lib/hotmap-layout'
import { heatColor } from '@/lib/korea-regions'
import type { HotmapRegion, HotmapSpot } from '@/lib/hotmap-types'

const VB = KOREA_MAP_VIEWBOX.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 524, 631]
const VB_W = VB[2] ?? 524
const VB_H = VB[3] ?? 631

type MapTooltip =
  | { kind: 'region'; code: string; x: number; y: number }
  | { kind: 'spot'; spot: HotmapSpot; x: number; y: number }

function positionTooltip(x: number, y: number, wrapW: number) {
  const pad = 12
  const flipX = x > wrapW * 0.62
  const flipY = y < 72
  return {
    left: flipX ? x - pad : x + pad,
    top: flipY ? y + pad : y - pad,
    transform: `${flipX ? 'translate(-100%, 0)' : 'none'} ${flipY ? '' : 'translateY(-100%)'}`,
  }
}

export default function KoreaHotMap({
  regions,
  hotspots,
  selectedCode,
  onSelectRegion,
  onSelectSpot,
}: {
  regions: HotmapRegion[]
  hotspots: HotmapSpot[]
  selectedCode: string | null
  onSelectRegion: (code: string | null) => void
  onSelectSpot: (spot: HotmapSpot) => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<MapTooltip | null>(null)

  const regionByCode = useMemo(
    () => Object.fromEntries(regions.map(r => [r.code, r])),
    [regions],
  )

  const visibleHotspots = useMemo(() => {
    if (!selectedCode) return hotspots
    return hotspots.filter(h => h.regionCode === selectedCode)
  }, [hotspots, selectedCode])

  const positionedHotspots = useMemo(() => {
    const byRegion = new Map<string, HotmapSpot[]>()
    visibleHotspots.forEach(spot => {
      const list = byRegion.get(spot.regionCode) ?? []
      list.push(spot)
      byRegion.set(spot.regionCode, list)
    })

    const placed: Array<HotmapSpot & { px: number; py: number }> = []
    byRegion.forEach((spots, code) => {
      const bbox = REGION_BBOX_BY_CODE[code]
      if (!bbox) {
        spots.forEach(s => placed.push({ ...s, px: s.x, py: s.y }))
        return
      }
      const total = spots.length
      spots.forEach((spot, index) => {
        const { x, y } = layoutHotspotInRegion(bbox, index, total)
        placed.push({ ...spot, px: x, py: y })
      })
    })
    return placed
  }, [visibleHotspots])

  const setPointerTooltip = useCallback((next: MapTooltip | null) => {
    setTooltip(next)
  }, [])

  const handleProvincePointer = useCallback(
    (code: string, e: React.PointerEvent<SVGPathElement>) => {
      const wrap = wrapRef.current
      if (!wrap) return
      const rect = wrap.getBoundingClientRect()
      setPointerTooltip({
        kind: 'region',
        code,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    },
    [setPointerTooltip],
  )

  const handleSpotPointer = useCallback(
    (spot: HotmapSpot, e: React.PointerEvent<SVGGElement>) => {
      e.stopPropagation()
      const wrap = wrapRef.current
      if (!wrap) return
      const rect = wrap.getBoundingClientRect()
      setPointerTooltip({
        kind: 'spot',
        spot,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    },
    [setPointerTooltip],
  )

  const hoveredCode = tooltip?.kind === 'region' ? tooltip.code : null
  const wrapW = wrapRef.current?.clientWidth ?? 400

  const tooltipStyle = tooltip
    ? positionTooltip(tooltip.x, tooltip.y, wrapW)
    : null

  const regionTooltipData =
    tooltip?.kind === 'region' ? regionByCode[tooltip.code] : null
  const regionTooltipName =
    tooltip?.kind === 'region'
      ? (regionTooltipData?.name ??
        KOREA_PROVINCES.find(p => p.code === tooltip.code)?.name)
      : ''

  return (
    <div className="korea-map-wrap" ref={wrapRef}>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className={`korea-map-svg${hoveredCode ? ' korea-map-svg--hovering' : ''}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="전국 청약 핫플레이스 지도"
        onPointerLeave={() => setPointerTooltip(null)}
      >
        <rect
          x={0}
          y={0}
          width={VB_W}
          height={VB_H}
          className="korea-map-bg"
          rx={12}
        />

        <g className="korea-provinces">
          {KOREA_PROVINCES.map(province => {
            const data = regionByCode[province.code]
            const heat = data?.heat ?? 0
            const active = selectedCode === province.code
            const hovered = hoveredCode === province.code

            return (
              <path
                key={province.id}
                d={province.path}
                className={[
                  'korea-province',
                  active && 'korea-province--active',
                  heat >= 3 && 'korea-province--hot',
                  hovered && 'korea-province--hovered',
                  hoveredCode && !hovered && 'korea-province--dimmed',
                ]
                  .filter(Boolean)
                  .join(' ')}
                fill={heatColor(heat)}
                stroke="var(--line)"
                strokeWidth={active || hovered ? 2 : 1}
                data-heat={heat}
                data-code={province.code}
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  onSelectRegion(selectedCode === province.code ? null : province.code)
                }
                onPointerEnter={e => handleProvincePointer(province.code, e)}
                onPointerMove={e => handleProvincePointer(province.code, e)}
                onPointerLeave={() => setPointerTooltip(null)}
              />
            )
          })}
        </g>

        {regions.map(r => {
          const show =
            r.heat >= 3 || selectedCode === r.code || hoveredCode === r.code
          if (!show) return null
          const c = REGION_CENTROID_BY_CODE[r.code]
          if (!c) return null
          return (
            <text
              key={`label-${r.code}`}
              x={c.x}
              y={c.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="korea-region-label"
              pointerEvents="none"
            >
              {r.name}
              {r.avgComp > 0 ? ` · ${r.avgComp}:1` : ''}
            </text>
          )
        })}

        {positionedHotspots.map(spot => {
          const hot = spot.compRate >= 10
          const cx = spot.px
          const cy = spot.py
          const spotHovered = tooltip?.kind === 'spot' && tooltip.spot.id === spot.id

          return (
            <g
              key={spot.id}
              className={`hot-marker${spotHovered ? ' hot-marker--hovered' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={e => {
                e.stopPropagation()
                onSelectSpot(spot)
              }}
              onPointerEnter={e => handleSpotPointer(spot, e)}
              onPointerMove={e => handleSpotPointer(spot, e)}
              onPointerLeave={() => setPointerTooltip(null)}
            >
              <circle
                cx={cx}
                cy={cy}
                r={hot ? 14 : 11}
                fill="transparent"
                pointerEvents="all"
              />
              {hot && (
                <>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={14}
                    className="hot-marker-glow"
                    fill="var(--hot)"
                    pointerEvents="none"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={10}
                    className="hot-marker-pulse-ring"
                    fill="none"
                    stroke="var(--hot)"
                    strokeWidth="1.5"
                    pointerEvents="none"
                  />
                </>
              )}
              <circle
                cx={cx}
                cy={cy}
                r={hot ? 5.5 : 4.5}
                className={`hot-marker-core${hot ? ' hot-marker-core--hot' : ''}`}
                pointerEvents="none"
              />
            </g>
          )
        })}
      </svg>

      {tooltip && tooltipStyle && (
        <div
          className="korea-map-tooltip"
          role="tooltip"
          style={{
            left: tooltipStyle.left,
            top: tooltipStyle.top,
            transform: tooltipStyle.transform,
          }}
        >
          {tooltip.kind === 'region' && (
            <>
              <p className="korea-map-tooltip__title">{regionTooltipName}</p>
              {regionTooltipData ? (
                <dl className="korea-map-tooltip__stats">
                  <div>
                    <dt>평균 경쟁률</dt>
                    <dd>
                      {regionTooltipData.avgComp > 0
                        ? `${regionTooltipData.avgComp}:1`
                        : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt>청약 단지</dt>
                    <dd>{regionTooltipData.projectCount}곳</dd>
                  </div>
                  <div>
                    <dt>공급 세대</dt>
                    <dd>{regionTooltipData.supplyUnits.toLocaleString()}세대</dd>
                  </div>
                </dl>
              ) : (
                <p className="korea-map-tooltip__hint">데이터 없음</p>
              )}
              <p className="korea-map-tooltip__hint">클릭하면 이 지역만 보기</p>
            </>
          )}
          {tooltip.kind === 'spot' && (
            <>
              <p className="korea-map-tooltip__title">{tooltip.spot.name}</p>
              <p className="korea-map-tooltip__sub">
                {tooltip.spot.regionName}
                {tooltip.spot.address ? ` · ${tooltip.spot.address}` : ''}
              </p>
              <dl className="korea-map-tooltip__stats">
                <div>
                  <dt>경쟁률</dt>
                  <dd>
                    {tooltip.spot.compRate > 0
                      ? `${tooltip.spot.compRate}:1`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt>공급</dt>
                  <dd>{tooltip.spot.units.toLocaleString()}세대</dd>
                </div>
              </dl>
              <p className="korea-map-tooltip__hint">클릭하면 상세 보기</p>
            </>
          )}
        </div>
      )}

      <div className="korea-map-legend">
        <span className="korea-legend-title">경쟁률 열기</span>
        <div className="korea-legend-bar">
          {([0, 1, 2, 3, 4] as const).map(l => (
            <div
              key={l}
              className="korea-legend-step"
              style={{ background: heatColor(l) }}
              title={['낮음', '보통', '주의', '높음', '매우 높음'][l]}
            />
          ))}
        </div>
        <div className="korea-legend-labels">
          <span>낮음</span>
          <span>매우 높음</span>
        </div>
      </div>
    </div>
  )
}
