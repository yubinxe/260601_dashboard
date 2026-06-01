'use client'

import { useMemo } from 'react'
import {
  KOREA_MAP_VIEWBOX,
  KOREA_PROVINCES,
  REGION_CENTROID_BY_CODE,
} from '@/lib/korea-map-data'
import { heatColor } from '@/lib/korea-regions'
import type { HotmapRegion, HotmapSpot } from '@/lib/hotmap-types'

const VB = KOREA_MAP_VIEWBOX.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 524, 631]
const VB_W = VB[2] ?? 524
const VB_H = VB[3] ?? 631

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
  const regionByCode = useMemo(
    () => Object.fromEntries(regions.map(r => [r.code, r])),
    [regions],
  )

  const visibleHotspots = useMemo(() => {
    if (!selectedCode) return hotspots
    return hotspots.filter(h => h.regionCode === selectedCode)
  }, [hotspots, selectedCode])

  return (
    <div className="korea-map-wrap">
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="korea-map-svg"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="전국 청약 핫플레이스 지도"
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

            return (
              <path
                key={province.id}
                d={province.path}
                className={`korea-province${active ? ' korea-province--active' : ''}${heat >= 3 ? ' korea-province--hot' : ''}`}
                fill={heatColor(heat)}
                stroke="var(--line)"
                strokeWidth={active ? 2 : 1}
                data-heat={heat}
                data-code={province.code}
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  onSelectRegion(selectedCode === province.code ? null : province.code)
                }
              >
                <title>
                  {data?.name ?? province.name}
                  {data && data.avgComp > 0 ? ` · 평균 ${data.avgComp}:1` : ''}
                </title>
              </path>
            )
          })}
        </g>

        {regions.map(r => {
          if (r.heat < 3 && selectedCode !== r.code) return null
          const c = REGION_CENTROID_BY_CODE[r.code]
          if (!c) return null
          return (
            <text
              key={`label-${r.code}`}
              x={c.x}
              y={c.y - 8}
              textAnchor="middle"
              className="korea-region-label"
              pointerEvents="none"
            >
              {r.name}
              {r.avgComp > 0 ? ` ${r.avgComp}:1` : ''}
            </text>
          )
        })}

        {visibleHotspots.map(spot => {
          const hot = spot.compRate >= 10
          const cx = spot.x
          const cy = spot.y
          return (
            <g
              key={spot.id}
              className="hot-marker"
              style={{ cursor: 'pointer' }}
              onClick={e => {
                e.stopPropagation()
                onSelectSpot(spot)
              }}
            >
              {hot && (
                <>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={14}
                    className="hot-marker-glow"
                    fill="var(--hot)"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={10}
                    className="hot-marker-pulse-ring"
                    fill="none"
                    stroke="var(--hot)"
                    strokeWidth="1.5"
                  />
                </>
              )}
              <circle
                cx={cx}
                cy={cy}
                r={hot ? 5.5 : 4.5}
                className={`hot-marker-core${hot ? ' hot-marker-core--hot' : ''}`}
              />
            </g>
          )
        })}
      </svg>

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
