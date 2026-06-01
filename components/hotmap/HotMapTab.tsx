'use client'

import { useEffect, useState } from 'react'
import { Card, CardHead } from '@/components/ui'
import KoreaHotMap from '@/components/hotmap/KoreaHotMap'
import HotmapBottomSheet from '@/components/hotmap/BottomSheet'
import type { HotmapPayload, HotmapSpot } from '@/lib/hotmap-types'

function fmtMonth(ym: string) {
  if (!ym || ym.length < 6) return ym || '최신'
  return `${ym.slice(0, 4)}년 ${ym.slice(4, 6)}월`
}

export default function HotMapTab() {
  const [data, setData] = useState<HotmapPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [selectedSpot, setSelectedSpot] = useState<HotmapSpot | null>(null)
  const [months, setMonths] = useState<string[]>([])
  const [month, setMonth] = useState('')

  useEffect(() => {
    fetch('/api/competition/stats?month=')
      .then(r => r.json())
      .then(json => {
        const m = [...new Set(
          ((json.data ?? []) as { STAT_DE: string }[]).map(d => d.STAT_DE),
        )].sort().reverse() as string[]
        if (m.length) {
          setMonths(m)
          setMonth(prev => prev || m[0])
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/hotmap?month=${encodeURIComponent(month)}`)
      .then(r => r.json())
      .then((payload: HotmapPayload) => {
        setData(payload)
        if (!month && payload.statMonth) setMonth(payload.statMonth)
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [month])

  const topHot = data?.regions
    .filter(r => r.avgComp > 0)
    .sort((a, b) => b.avgComp - a.avgComp)
    .slice(0, 3) ?? []

  return (
    <div className="hotmap-tab">
      <div className="predict-hero rise">
        <span className="predict-badge">Hot Map</span>
        <h2 className="predict-title">청약 핫플레이스</h2>
        <p className="predict-desc">
          분양 위치와 지역별 경쟁률을 한눈에. 붉은 글로우·펄스 마커는 고경쟁 구간이며, 마커를 누르면 단지 요약이 열립니다.
        </p>
      </div>

      {topHot.length > 0 && (
        <div className="hotmap-chips rise">
          {topHot.map(r => (
            <button
              key={r.code}
              type="button"
              className={`hotmap-chip${selectedRegion === r.code ? ' hotmap-chip--on' : ''}`}
              onClick={() => setSelectedRegion(selectedRegion === r.code ? null : r.code)}
            >
              <span className="hotmap-chip-dot" data-heat={r.heat} />
              {r.name}
              <strong className="tnum">{r.avgComp}:1</strong>
            </button>
          ))}
        </div>
      )}

      <Card className="rise hotmap-card">
        <CardHead
          title="전국 분양·경쟁률 지도"
          sub={data ? `기준 ${fmtMonth(data.statMonth)} · 전국 평균 ${data.nationalAvg}:1` : '데이터 로드 중'}
          right={
            months.length > 0 ? (
              <select
                className="predict-select field-focus"
                value={month}
                onChange={e => setMonth(e.target.value)}
                style={{ minWidth: 130 }}
              >
                {months.map(m => (
                  <option key={m} value={m}>{fmtMonth(m)}</option>
                ))}
              </select>
            ) : undefined
          }
        />

        {loading ? (
          <div className="hotmap-skeleton">
            <div style={{ height: 400, minHeight: 360, borderRadius: 'var(--r-md)', background: 'var(--track)' }} />
          </div>
        ) : data ? (
          <>
            <KoreaHotMap
              regions={data.regions}
              hotspots={data.hotspots}
              selectedCode={selectedRegion}
              onSelectRegion={setSelectedRegion}
              onSelectSpot={setSelectedSpot}
            />
            <p className="predict-disclaimer" style={{ marginTop: 16, textAlign: 'left' }}>
              * 마커 위치는 공급지역 기준으로 표시됩니다. 경쟁률은 지역 통계·단지별 API를 조합한 값입니다.
              {selectedRegion && (
                <>
                  {' '}
                  <button
                    type="button"
                    className="link-ink"
                    style={{ fontSize: 'inherit' }}
                    onClick={() => setSelectedRegion(null)}
                  >
                    전국 보기
                  </button>
                </>
              )}
            </p>
          </>
        ) : (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-3)' }}>지도 데이터를 불러올 수 없습니다</div>
        )}
      </Card>

      <HotmapBottomSheet spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
    </div>
  )
}
