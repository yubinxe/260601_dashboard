'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { fetchWinnersAge, fetchWinnersRegion, fetchWinnersScore } from '@/lib/api'
import type { AgeStatItem, AreaStatItem, ScoreStatItem } from '@/lib/types'

// YYYYMM → YYYY년 MM월
function fmtMonth(ym: string) {
  if (!ym || ym.length < 6) return ym
  return `${ym.slice(0, 4)}년 ${ym.slice(4, 6)}월`
}

function MonthSelect({
  value,
  months,
  onChange,
}: {
  value: string
  months: string[]
  onChange: (v: string) => void
}) {
  if (months.length === 0) return null
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {months.map(m => (
        <option key={m} value={m}>{fmtMonth(m)}</option>
      ))}
    </select>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-1">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-2xl font-bold text-slate-800">{value}</span>
      {sub && <span className="text-xs text-slate-400">{sub}</span>}
    </div>
  )
}

export default function WinnersTab() {
  // ── 연령별 통계 ─────────────────────────────────────
  const [allAgeApplicants, setAllAgeApplicants] = useState<AgeStatItem[]>([])
  const [allAgeWinners, setAllAgeWinners]       = useState<AgeStatItem[]>([])
  const [ageMonths, setAgeMonths]               = useState<string[]>([])
  const [ageMonth, setAgeMonth]                 = useState('')
  const [ageMode, setAgeMode]                   = useState<'applicants' | 'winners'>('winners')
  const [ageLoading, setAgeLoading]             = useState(false)

  useEffect(() => {
    setAgeLoading(true)
    fetchWinnersAge({ monthFrom: '', monthTo: '' })
      .then(r => {
        setAllAgeApplicants(r.applicants)
        setAllAgeWinners(r.winners)
        const months = [...new Set([
          ...r.applicants.map(d => d.STAT_DE),
          ...r.winners.map(d => d.STAT_DE),
        ])].sort().reverse()
        setAgeMonths(months)
        if (months.length > 0) setAgeMonth(months[0])
      })
      .catch(() => {})
      .finally(() => setAgeLoading(false))
  }, [])

  const ageSource = ageMode === 'applicants' ? allAgeApplicants : allAgeWinners
  const currentAgeItem = ageSource.find(d => d.STAT_DE === ageMonth)
  const ageChartData = currentAgeItem ? [
    { name: '30대', value: Number(currentAgeItem.AGE_30) || 0 },
    { name: '40대', value: Number(currentAgeItem.AGE_40) || 0 },
    { name: '50대', value: Number(currentAgeItem.AGE_50) || 0 },
    { name: '60대+', value: Number(currentAgeItem.AGE_60) || 0 },
  ] : []

  // ── 지역별 통계 ─────────────────────────────────────
  const [allRegionApplicants, setAllRegionApplicants] = useState<AreaStatItem[]>([])
  const [allRegionWinners, setAllRegionWinners]       = useState<AreaStatItem[]>([])
  const [regionMonths, setRegionMonths]               = useState<string[]>([])
  const [regionMonth, setRegionMonth]                 = useState('')
  const [regionLoading, setRegionLoading]             = useState(false)

  useEffect(() => {
    setRegionLoading(true)
    fetchWinnersRegion({ month: '' })
      .then(r => {
        setAllRegionApplicants(r.applicants)
        setAllRegionWinners(r.winners)
        const months = [...new Set([
          ...r.applicants.map(d => d.STAT_DE),
          ...r.winners.map(d => d.STAT_DE),
        ])].sort().reverse()
        setRegionMonths(months)
        if (months.length > 0) setRegionMonth(months[0])
      })
      .catch(() => {})
      .finally(() => setRegionLoading(false))
  }, [])

  const regionMap = new Map<string, { name: string; 신청자: number; 당첨자: number }>()
  allRegionApplicants
    .filter(d => d.STAT_DE === regionMonth)
    .forEach(r => {
      regionMap.set(r.SUBSCRPT_AREA_CODE, {
        name: r.SUBSCRPT_AREA_CODE_NM,
        신청자: Number(r.AGE_30) + Number(r.AGE_40) + Number(r.AGE_50) + Number(r.AGE_60),
        당첨자: 0,
      })
    })
  allRegionWinners
    .filter(d => d.STAT_DE === regionMonth)
    .forEach(r => {
      const prev = regionMap.get(r.SUBSCRPT_AREA_CODE)
      if (prev) prev.당첨자 = Number(r.AGE_30) + Number(r.AGE_40) + Number(r.AGE_50) + Number(r.AGE_60)
    })
  const regionChartData = Array.from(regionMap.values())

  // ── 가점 통계 ────────────────────────────────────────
  const [allScoreData, setAllScoreData]   = useState<ScoreStatItem[]>([])
  const [scoreMonths, setScoreMonths]     = useState<string[]>([])
  const [scoreMonth, setScoreMonth]       = useState('')
  const [scoreRegion, setScoreRegion]     = useState('')
  const [scoreLoading, setScoreLoading]   = useState(false)

  const REGIONS = [
    { code: '', name: '전체' },
    { code: '100', name: '서울' }, { code: '200', name: '강원' }, { code: '300', name: '대전' },
    { code: '312', name: '충남' }, { code: '338', name: '세종' }, { code: '360', name: '충북' },
    { code: '400', name: '인천' }, { code: '410', name: '경기' }, { code: '500', name: '광주' },
    { code: '513', name: '전남' }, { code: '560', name: '전북' }, { code: '600', name: '부산' },
    { code: '621', name: '경남' }, { code: '680', name: '울산' }, { code: '690', name: '제주' },
    { code: '700', name: '대구' }, { code: '712', name: '경북' },
  ]

  useEffect(() => {
    setScoreLoading(true)
    fetchWinnersScore({ month: '', region: scoreRegion })
      .then(r => {
        const data = r.data ?? []
        setAllScoreData(data)
        const months = [...new Set(data.map(d => d.STAT_DE))].sort().reverse()
        setScoreMonths(months)
        if (months.length > 0) setScoreMonth(months[0])
      })
      .catch(() => {})
      .finally(() => setScoreLoading(false))
  }, [scoreRegion])

  const filteredScore = allScoreData.filter(d =>
    d.STAT_DE === scoreMonth && (!scoreRegion || d.SUBSCRPT_AREA_CODE === scoreRegion)
  )

  const avgScore = filteredScore.length > 0
    ? (filteredScore.reduce((s, d) => s + parseFloat(d.AVRG_SCORE || '0'), 0) / filteredScore.length).toFixed(1)
    : '-'
  const maxTop = filteredScore.length > 0
    ? Math.max(...filteredScore.map(d => parseFloat(d.TOP_SCORE || '0'))).toString()
    : '-'
  const minLow = filteredScore.length > 0
    ? Math.min(...filteredScore.map(d => parseFloat(d.LWET_SCORE || '0'))).toString()
    : '-'
  const medScore = filteredScore.length > 0
    ? (filteredScore.reduce((s, d) => s + parseFloat(d.MED_SCORE || '0'), 0) / filteredScore.length).toFixed(1)
    : '-'

  return (
    <div className="space-y-6">
      {/* ── 연령대별 현황 ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-slate-800">연령대별 현황</h3>
            <p className="text-xs text-slate-400 mt-0.5">30대 ~ 60대 이상 분포</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-sm">
              <button
                onClick={() => setAgeMode('applicants')}
                className={`px-4 py-1.5 ${ageMode === 'applicants' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                신청자
              </button>
              <button
                onClick={() => setAgeMode('winners')}
                className={`px-4 py-1.5 ${ageMode === 'winners' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                당첨자
              </button>
            </div>
            <MonthSelect value={ageMonth} months={ageMonths} onChange={setAgeMonth} />
          </div>
        </div>
        {ageLoading ? (
          <div className="h-56 bg-slate-50 rounded-lg animate-pulse" />
        ) : ageChartData.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-slate-400 text-sm">데이터 없음</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ageChartData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => v.toLocaleString()} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [Number(v).toLocaleString() + '명', ageMode === 'winners' ? '당첨자' : '신청자']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="value" name={ageMode === 'winners' ? '당첨자' : '신청자'} fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── 지역별 신청·당첨자 ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-slate-800">지역별 신청·당첨자 현황</h3>
            <p className="text-xs text-slate-400 mt-0.5">전연령 합산 기준</p>
          </div>
          <MonthSelect value={regionMonth} months={regionMonths} onChange={setRegionMonth} />
        </div>
        {regionLoading ? (
          <div className="h-64 bg-slate-50 rounded-lg animate-pulse" />
        ) : regionChartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">데이터 없음</div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={regionChartData} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={v => v.toLocaleString()} />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any, name: any) => [Number(v).toLocaleString() + '명', name]}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="신청자" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="당첨자" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── 가점 통계 ── */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-slate-800">가점제 당첨 통계</h3>
            <p className="text-xs text-slate-400 mt-0.5">지역·거주구분별 가점 분포</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={scoreRegion}
              onChange={e => setScoreRegion(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REGIONS.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
            </select>
            <MonthSelect value={scoreMonth} months={scoreMonths} onChange={setScoreMonth} />
          </div>
        </div>

        {scoreLoading ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
            <div className="h-32 bg-slate-50 rounded-lg animate-pulse" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <StatCard label="평균 가점" value={avgScore !== '-' ? `${avgScore}점` : '-'} sub="선택 지역 평균" />
              <StatCard label="중위 가점" value={medScore !== '-' ? `${medScore}점` : '-'} sub="중앙값" />
              <StatCard label="최고 가점" value={maxTop !== '-' ? `${maxTop}점` : '-'} sub="최고 기록" />
              <StatCard label="최저 가점" value={minLow !== '-' ? `${minLow}점` : '-'} sub="최저 기록" />
            </div>

            {filteredScore.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">지역</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold text-slate-500">거주구분</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">평균</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">중위</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">최고</th>
                      <th className="px-4 py-2 text-right text-xs font-semibold text-slate-500">최저</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredScore.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium text-slate-800">{item.SUBSCRPT_AREA_CODE_NM}</td>
                        <td className="px-4 py-2 text-slate-600">{item.RESIDE_SECD_NM}</td>
                        <td className="px-4 py-2 text-right font-semibold text-blue-600">{item.AVRG_SCORE}점</td>
                        <td className="px-4 py-2 text-right text-slate-600">{item.MED_SCORE}점</td>
                        <td className="px-4 py-2 text-right text-green-600">{item.TOP_SCORE}점</td>
                        <td className="px-4 py-2 text-right text-slate-400">{item.LWET_SCORE}점</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-slate-400 text-sm">
                해당 조건의 데이터가 없습니다
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
