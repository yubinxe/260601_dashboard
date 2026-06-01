'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { fetchCompetitionStats, fetchCompetitionSearch, fetchSpecialSupply } from '@/lib/api'
import type { CompetitionStatItem, CompetitionItem, SpecialSupplyItem } from '@/lib/types'
import { format, subMonths } from 'date-fns'

const SPECIAL_LABELS: Record<string, string> = {
  MNYCH_HSHLDCO: '다자녀',
  NWWDS_NMTW_HSHLDCO: '신혼부부',
  LFE_FRST_HSHLDCO: '생애최초',
  YGMN_HSHLDCO: '청년',
  OLD_PARNTS_SUPORT_HSHLDCO: '노부모부양',
  NWBB_NWBBSHR_HSHLDCO: '신생아',
  INSTT_RECOMEND_HSHLDCO: '기관추천',
}

function MonthPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="month"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}

export default function CompetitionTab() {
  const defaultMonth = format(subMonths(new Date(), 1), 'yyyy-MM')

  // ── 지역별 경쟁률 ─────────────────────────────────
  const [statsMonth, setStatsMonth] = useState(defaultMonth)
  const [statsData, setStatsData] = useState<CompetitionStatItem[]>([])
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState('')

  useEffect(() => {
    setStatsLoading(true)
    setStatsError('')
    fetchCompetitionStats({ month: statsMonth.replace('-', '') })
      .then(r => setStatsData(r.data ?? []))
      .catch(() => setStatsError('데이터 로드 오류'))
      .finally(() => setStatsLoading(false))
  }, [statsMonth])

  const chartData = statsData.map(d => ({
    name: d.SUBSCRPT_AREA_CODE_NM,
    특별공급: parseFloat(d.SPSPLY_CMPET_RATE) || 0,
    일반공급: parseFloat(d.SUPLY_CMPET_RATE) || 0,
  }))

  // ── 단지별 경쟁률 검색 ────────────────────────────
  const [pblancNo, setPblancNo] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [compData, setCompData] = useState<CompetitionItem[]>([])
  const [spData, setSpData] = useState<SpecialSupplyItem[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  const handleSearch = async () => {
    if (!searchInput.trim()) return
    setSearchLoading(true)
    setSearchError('')
    try {
      const [comp, sp] = await Promise.all([
        fetchCompetitionSearch({ pblancNo: searchInput.trim() }),
        fetchSpecialSupply({ pblancNo: searchInput.trim() }),
      ])
      setCompData(comp.data ?? [])
      setSpData(sp.data ?? [])
      setPblancNo(searchInput.trim())
    } catch {
      setSearchError('검색 중 오류가 발생했습니다.')
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ── 지역별 경쟁률 통계 ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800">지역별 청약 경쟁률</h3>
            <p className="text-xs text-slate-400 mt-0.5">특별공급 / 일반공급 경쟁률 비교</p>
          </div>
          <MonthPicker value={statsMonth} onChange={setStatsMonth} />
        </div>
        {statsLoading ? (
          <div className="h-64 bg-slate-50 rounded-lg animate-pulse" />
        ) : statsError ? (
          <div className="h-64 flex items-center justify-center text-red-500 text-sm">{statsError}</div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            해당 월 데이터가 없습니다
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => `${v}:1`} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${Number(value).toFixed(2)}:1`]}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="특별공급" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="일반공급" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── 단지별 경쟁률 검색 ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-1">단지별 경쟁률 상세 조회</h3>
        <p className="text-xs text-slate-400 mb-4">분양정보 탭에서 확인한 공고번호(PBLANC_NO)를 입력하세요</p>
        <div className="flex gap-2 mb-5">
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="공고번호 입력 (예: 2024000001)"
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={searchLoading}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {searchLoading ? '검색 중...' : '조회'}
          </button>
        </div>

        {searchError && <p className="text-red-500 text-sm mb-4">{searchError}</p>}

        {pblancNo && !searchLoading && (
          <div className="space-y-4">
            {/* 경쟁률 */}
            {compData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">주택형별 경쟁률</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">주택형</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">공급세대</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">거주구분</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">신청건수</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">경쟁률</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {compData.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-medium">{item.HOUSE_TY}</td>
                          <td className="px-4 py-2 text-right text-slate-600">{Number(item.SUPLY_HSHLDCO).toLocaleString()}</td>
                          <td className="px-4 py-2 text-slate-600">{item.RESIDE_SENM}</td>
                          <td className="px-4 py-2 text-right text-slate-600">{Number(item.REQ_CNT).toLocaleString()}</td>
                          <td className="px-4 py-2 text-right">
                            <span className={`font-semibold ${
                              parseFloat(item.CMPET_RATE) >= 10 ? 'text-red-600' :
                              parseFloat(item.CMPET_RATE) >= 3 ? 'text-orange-500' : 'text-green-600'
                            }`}>
                              {parseFloat(item.CMPET_RATE).toFixed(2)}:1
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 특별공급 현황 */}
            {spData.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">특별공급 신청현황</h4>
                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">주택형</th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">특별공급</th>
                        {Object.entries(SPECIAL_LABELS).map(([key, label]) => (
                          <th key={key} className="px-4 py-2 text-right text-xs font-semibold text-slate-500 whitespace-nowrap">
                            {label}
                          </th>
                        ))}
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">결과</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {spData.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-2 font-medium">{item.HOUSE_TY}</td>
                          <td className="px-4 py-2 text-right text-slate-600">{Number(item.SPSPLY_HSHLDCO).toLocaleString()}</td>
                          {Object.keys(SPECIAL_LABELS).map(key => (
                            <td key={key} className="px-4 py-2 text-right text-slate-600">
                              {item[key as keyof SpecialSupplyItem] || '-'}
                            </td>
                          ))}
                          <td className="px-4 py-2 text-slate-600 whitespace-nowrap">{item.SUBSCRPT_RESULT_NM || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {compData.length === 0 && spData.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-6">해당 공고번호의 데이터가 없습니다</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
