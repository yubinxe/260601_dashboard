'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { fetchAnnouncements } from '@/lib/api'
import type { Announcement, AnnouncementsResponse } from '@/lib/types'
import { formatDate, formatMonth } from '@/lib/format'
import { InkTag, InkLink, Pagination } from '@/components/ui/interactive'
import { format, subMonths } from 'date-fns'

const REGIONS = [
  { code: '', name: '전체' },
  { code: '100', name: '서울' },
  { code: '400', name: '인천' },
  { code: '410', name: '경기' },
  { code: '200', name: '강원' },
  { code: '300', name: '대전' },
  { code: '312', name: '충남' },
  { code: '338', name: '세종' },
  { code: '360', name: '충북' },
  { code: '500', name: '광주' },
  { code: '513', name: '전남' },
  { code: '560', name: '전북' },
  { code: '600', name: '부산' },
  { code: '621', name: '경남' },
  { code: '680', name: '울산' },
  { code: '690', name: '제주' },
  { code: '700', name: '대구' },
  { code: '712', name: '경북' },
]

const S: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--r-lg)',
    boxShadow: 'var(--shadow)',
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--ink-3)',
    marginBottom: 6,
    display: 'block',
    letterSpacing: '0.01em',
  },
  input: {
    padding: '9px 14px',
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--line)',
    background: 'var(--surface)',
    color: 'var(--ink)',
    fontSize: 13.5,
    fontFamily: 'inherit',
    outline: 'none',
    width: '100%',
    transition: 'border-color .2s var(--ease), box-shadow .2s var(--ease)',
  },
  select: {
    padding: '9px 32px 9px 14px',
    borderRadius: 'var(--r-sm)',
    border: '1px solid var(--line)',
    background: 'var(--surface)',
    color: 'var(--ink)',
    fontSize: 13.5,
    fontFamily: 'inherit',
    outline: 'none',
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    cursor: 'pointer',
    transition: 'border-color .2s var(--ease), box-shadow .2s var(--ease)',
  },
  th: {
    padding: '14px 20px',
    fontSize: 11.5,
    fontWeight: 650,
    color: 'var(--ink-3)',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap' as const,
    textAlign: 'left' as const,
    background: 'var(--surface-2)',
    borderBottom: '1px solid var(--line)',
  },
  td: {
    padding: '14px 20px',
    fontSize: 13.5,
    color: 'var(--ink-2)',
    whiteSpace: 'nowrap' as const,
    borderBottom: '1px solid var(--line)',
  },
}

function propertyPath(item: Announcement) {
  const id = item.PBLANC_NO || item.HOUSE_MANAGE_NO
  return `/property/${encodeURIComponent(id)}`
}

export default function AnnouncementTab() {
  const router = useRouter()
  const today = new Date()
  const [region, setRegion] = useState('')
  const [dateFrom, setDateFrom] = useState(format(subMonths(today, 3), 'yyyy-MM-dd'))
  const [dateTo, setDateTo] = useState(format(today, 'yyyy-MM-dd'))
  const [houseName, setHouseName] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<AnnouncementsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async (p: number) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchAnnouncements({ page: p, perPage: 15, region, dateFrom, dateTo, houseName })
      setData(res)
    } catch {
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [region, dateFrom, dateTo, houseName])

  useEffect(() => { load(1); setPage(1) }, [load])

  const totalPages = data ? Math.ceil(data.totalCount / 15) : 1

  const goDetail = (item: Announcement) => {
    router.push(propertyPath(item))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap)' }}>
      <div className="rise" style={{ ...S.card, padding: 'var(--pad-card)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
          <div>
            <label style={S.label}>공급지역</label>
            <div style={{ position: 'relative' }}>
              <select value={region} onChange={e => setRegion(e.target.value)} style={S.select} className="field-focus">
                {REGIONS.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
              </select>
              <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
              </span>
            </div>
          </div>
          <div>
            <label style={S.label}>공고일 시작</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...S.input, width: 'auto' }} className="field-focus" />
          </div>
          <div>
            <label style={S.label}>공고일 종료</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...S.input, width: 'auto' }} className="field-focus" />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={S.label}>주택명 검색</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)', display: 'flex' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              </span>
              <input
                type="text"
                value={houseName}
                onChange={e => setHouseName(e.target.value)}
                placeholder="주택명 입력"
                style={{ ...S.input, paddingLeft: 36 }}
                className="field-focus"
              />
            </div>
          </div>
        </div>
      </div>

      {data && (
        <p style={{ margin: 0, fontSize: 13.5, color: 'var(--ink-3)' }}>
          총 <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{data.totalCount.toLocaleString()}</span>건
          <span style={{ marginLeft: 8, fontSize: 12.5 }}>· 행을 클릭하면 상세 페이지로 이동합니다</span>
        </p>
      )}

      <div style={{ ...S.card, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 'var(--pad-card)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shimmer-bar" />
            ))}
          </div>
        ) : error ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--hot)', fontSize: 14 }}>{error}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr>
                  {['주택명', '유형', '공급지역', '총세대수', '모집공고일', '청약접수', '입주예정', '분양가상한', '청약홈'].map((h, i) => (
                    <th key={h} style={{ ...S.th, textAlign: i === 3 ? 'right' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14 }}>
                      검색 결과가 없습니다
                    </td>
                  </tr>
                ) : (
                  (data?.data ?? []).map((item: Announcement, i) => (
                    <tr
                      key={`${item.PBLANC_NO}-${i}`}
                      className="click-row"
                      onClick={() => goDetail(item)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goDetail(item) } }}
                      tabIndex={0}
                      role="link"
                      aria-label={`${item.HOUSE_NM} 상세 보기`}
                    >
                      <td style={{ ...S.td, fontWeight: 650, color: 'var(--ink)', maxWidth: 200 }}>
                        <div className="row-title-cell">
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.HOUSE_NM}</span>
                          <svg className="row-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </div>
                      </td>
                      <td style={S.td}>
                        <InkTag>{item.HOUSE_DTL_SECD_NM || item.HOUSE_SECD_NM}</InkTag>
                      </td>
                      <td style={S.td}>{item.SUBSCRPT_AREA_CODE_NM}</td>
                      <td style={{ ...S.td, textAlign: 'right' }} className="tnum">
                        {item.TOT_SUPLY_HSHLDCO ? Number(item.TOT_SUPLY_HSHLDCO).toLocaleString() : '-'}
                      </td>
                      <td style={S.td} className="tnum">
                        {item.RCRIT_PBLANC_DE ? formatDate(item.RCRIT_PBLANC_DE.replace(/-/g, '')) : '-'}
                      </td>
                      <td style={S.td} className="tnum">
                        {item.RCEPT_BGNDE && item.RCEPT_ENDDE
                          ? `${formatDate(item.RCEPT_BGNDE.replace(/-/g, ''))} ~ ${formatDate(item.RCEPT_ENDDE.replace(/-/g, ''))}`
                          : '-'}
                      </td>
                      <td style={S.td} className="tnum">
                        {item.MVN_PREARNGE_YM ? formatMonth(item.MVN_PREARNGE_YM) : '-'}
                      </td>
                      <td style={S.td}>
                        {item.NSPRC_NM === '해당'
                          ? <span style={{ fontSize: 12, fontWeight: 650, color: 'var(--ink)' }}>해당</span>
                          : <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>-</span>}
                      </td>
                      <td style={S.td} onClick={e => e.stopPropagation()}>
                        {item.PBLANC_URL ? (
                          <InkLink href={item.PBLANC_URL} external onClick={e => e.stopPropagation()}>
                            바로가기 →
                          </InkLink>
                        ) : (
                          <InkLink href={propertyPath(item)}>상세 보기 →</InkLink>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={p => { setPage(p); load(p) }}
      />
    </div>
  )
}
