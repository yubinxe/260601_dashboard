'use client'

import { Icon } from '@/components/ui'
import type { DashboardKpi } from '@/lib/announcement-helpers'

export default function KpiStrip({ kpi }: { kpi: DashboardKpi }) {
  const stats = [
    { label: '접수중', value: kpi.openCount, unit: '건', icon: 'spark' as const },
    { label: '마감 임박', value: kpi.soonCount, unit: '건', icon: 'clock' as const, hot: true },
    { label: '총 공급세대', value: kpi.totalUnits, unit: '세대', icon: 'home' as const, big: true },
    { label: '데이터 기준', value: kpi.updated, unit: '', icon: 'chart' as const, text: true },
  ]

  return (
    <div
      className="rise kpi-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--gap)',
        marginBottom: 'var(--gap)',
      }}
    >
      {stats.map(s => (
        <div
          key={s.label}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            padding: '18px 22px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            boxShadow: 'var(--shadow)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: s.hot ? 'var(--hot)' : 'var(--ink-3)' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>{s.label}</span>
            <Icon name={s.icon} size={16} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, whiteSpace: 'nowrap' }}>
            <span
              className={s.text ? undefined : 'tnum'}
              style={{
                fontSize: s.text ? 15 : 30,
                fontWeight: s.text ? 600 : 770,
                letterSpacing: s.text ? '-0.01em' : '-0.035em',
                color: s.hot ? 'var(--hot)' : 'var(--ink)',
              }}
            >
              {s.text ? s.value : typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
            </span>
            {s.unit && (
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-3)' }}>{s.unit}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
