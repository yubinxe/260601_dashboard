'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchAnnouncements } from '@/lib/api'
import type { Announcement, AnnouncementsResponse } from '@/lib/types'
import { format, subMonths } from 'date-fns'

const REGIONS = [
  { code: '', name: '전체' },
  { code: '100', name: '서울' },
  { code: '200', name: '인천' },
  { code: '300', name: '경기' },
  { code: '400', name: '강원' },
  { code: '500', name: '충북' },
  { code: '600', name: '충남' },
  { code: '700', name: '대전' },
  { code: '800', name: '전북' },
  { code: '900', name: '전남' },
  { code: '1000', name: '광주' },
  { code: '1100', name: '경북' },
  { code: '1200', name: '경남' },
  { code: '1300', name: '대구' },
  { code: '1400', name: '울산' },
  { code: '1500', name: '부산' },
  { code: '1600', name: '제주' },
  { code: '1700', name: '세종' },
]

function formatDate(s: string) {
  if (!s || s.length < 8) return s ?? '-'
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}

function formatMonth(s: string) {
  if (!s || s.length < 6) return s ?? '-'
  return `${s.slice(0, 4)}.${s.slice(4, 6)}`
}

export default function AnnouncementTab() {
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
      const res = await fetchAnnouncements({
        page: p,
        perPage: 15,
        region,
        dateFrom: dateFrom.replace(/-/g, ''),
        dateTo: dateTo.replace(/-/g, ''),
        houseName,
      })
      setData(res)
    } catch {
      setError('데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }, [region, dateFrom, dateTo, houseName])

  useEffect(() => { load(1); setPage(1) }, [load])

  const totalPages = data ? Math.ceil(data.totalCount / 15) : 1

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">공급지역</label>
          <select
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {REGIONS.map(r => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">공고일 시작</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">공고일 종료</label>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 min-w-40">
          <label className="block text-xs font-medium text-slate-500 mb-1">주택명 검색</label>
          <input
            type="text"
            value={houseName}
            onChange={e => setHouseName(e.target.value)}
            placeholder="주택명 입력"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 결과 요약 */}
      {data && (
        <p className="text-sm text-slate-500">
          총 <span className="font-semibold text-slate-800">{data.totalCount.toLocaleString()}</span>건
        </p>
      )}

      {/* 테이블 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">주택명</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">유형</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">공급지역</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">총세대수</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">모집공고일</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">청약접수</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">입주예정</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">분양가상한</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">청약홈</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.data ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                      검색 결과가 없습니다
                    </td>
                  </tr>
                ) : (
                  (data?.data ?? []).map((item: Announcement, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap max-w-48 truncate">
                        {item.HOUSE_NM}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
                          {item.HOUSE_DTL_SECD_NM || item.HOUSE_SECD_NM}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.SUBSCRPT_AREA_CODE_NM}</td>
                      <td className="px-4 py-3 text-slate-600 text-right whitespace-nowrap">
                        {item.TOT_SUPLY_HSHLDCO ? Number(item.TOT_SUPLY_HSHLDCO).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {item.RCRIT_PBLANC_DE ? formatDate(item.RCRIT_PBLANC_DE.replace(/-/g, '')) : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {item.RCEPT_BGNDE && item.RCEPT_ENDDE
                          ? `${formatDate(item.RCEPT_BGNDE.replace(/-/g, ''))} ~ ${formatDate(item.RCEPT_ENDDE.replace(/-/g, ''))}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {item.MVN_PREARNGE_YM ? formatMonth(item.MVN_PREARNGE_YM) : '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.NSPRC_NM === '해당' ? (
                          <span className="text-xs text-green-600 font-medium">해당</span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.PBLANC_URL ? (
                          <a
                            href={item.PBLANC_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            바로가기 →
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
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

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          <button
            onClick={() => { const p = Math.max(1, page - 1); setPage(p); load(p) }}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4))
            const p = start + i
            return (
              <button
                key={p}
                onClick={() => { setPage(p); load(p) }}
                className={`px-3 py-1.5 text-sm rounded-lg border ${
                  p === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            )
          })}
          <button
            onClick={() => { const p = Math.min(totalPages, page + 1); setPage(p); load(p) }}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
