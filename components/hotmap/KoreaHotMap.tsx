'use client'

import { useMemo, useState } from 'react'
import { KOREA_OUTLINE, KOREA_VIEWBOX, heatColor } from '@/lib/korea-regions'
import type { HotmapRegion, HotmapSpot } from '@/lib/hotmap-types'

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
  const [hoverCode, setHoverCode] = useState<string | null>(null)

  const visibleHotspots = useMemo(() => {
    if (!selectedCode) return hotspots
    return hotspots.filter(h => h.regionCode === selectedCode)
  }, [hotspots, selectedCode])

  return (
    <div className="korea-map-wrap">
      <svg
        viewBox={`0 0 ${KOREA_VIEWBOX.w} ${KOREA_VIEWBOX.h}`}
        className="korea-map-svg"
        role="img"
        aria-label="전국 청약 핫플레이스 지도"
      >
        <defs>
          {[0, 1, 2, 3, 4].map(level => (
            <radialGradient key={level} id={`heat-glow-${level}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={level >= 3 ? 'var(--hot)' : level >= 1 ? 'var(--warn)' : 'var(--ink)'} stopOpacity={0.55 - level * 0.08} />
              <stop offset="100%" stopColor="var(--bg-sub)" stopOpacity="0" />
            </radialGradient>
          ))}
          <filter id="hot-glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={KOREA_OUTLINE}
          className="korea-outline"
          fill="var(--surface-2)"
          stroke="var(--line)"
          strokeWidth="1.5"
        />

        {regions.map(r => {
          const active = hoverCode === r.code || selectedCode === r.code
          const radius = 28 + r.heat * 14 + (r.projectCount > 0 ? 6 : 0)
          return (
            <g
              key={r.code}
              className="korea-region"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoverCode(r.code)}
              onMouseLeave={() => setHoverCode(null)}
              onClick={() => onSelectRegion(selectedCode === r.code ? null : r.code)}
            >
              <circle
                cx={r.x}
                cy={r.y}
                r={radius}
                fill={`url(#heat-glow-${r.heat})`}
                className={`korea-heat-blob${active ? ' korea-heat-blob--active' : ''}`}
              />
              <circle
                cx={r.x}
                cy={r.y}
                r={active ? 7 : 5}
                className={`korea-region-dot${r.heat >= 3 ? ' korea-region-dot--hot' : ''}`}
              />
              {(active || r.heat >= 3) && (
                <text
                  x={r.x}
                  y={r.y - radius - 6}
                  textAnchor="middle"
                  className="korea-region-label"
                >
                  {r.name} {r.avgComp > 0 ? `${r.avgComp}:1` : ''}
                </text>
              )}
            </g>
          )
        })}

        {visibleHotspots.map(spot => {
          const hot = spot.compRate >= 10
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
                    cx={spot.x}
                    cy={spot.y}
                    r={16}
                    className="hot-marker-glow"
                    fill="var(--hot)"
                    opacity={0.2}
                  />
                  <circle
                    cx={spot.x}
                    cy={spot.y}
                    r={10}
                    className="hot-marker-pulse-ring"
                    fill="none"
                    stroke="var(--hot)"
                    strokeWidth="1.5"
                  />
                </>
              )}
              <circle
                cx={spot.x}
                cy={spot.y}
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
