'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const AnnouncementTab = dynamic(() => import('@/components/announcements/AnnouncementTab'), { ssr: false })
const CompetitionTab  = dynamic(() => import('@/components/competition/CompetitionTab'),   { ssr: false })
const WinnersTab      = dynamic(() => import('@/components/winners/WinnersTab'),            { ssr: false })

const TABS = [
  { id: 'announcements', label: '📋 분양정보', sub: '모집공고 목록' },
  { id: 'competition',   label: '🔥 경쟁률 현황', sub: '실시간 접수 경쟁률' },
  { id: 'winners',       label: '📊 당첨자 통계', sub: '신청·당첨 분석' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function Page() {
  const [activeTab, setActiveTab] = useState<TabId>('announcements')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">🏠 청약 현황 대시보드</h1>
              <p className="text-blue-100 text-sm mt-0.5">청약홈 공공데이터 기반 실시간 분석</p>
            </div>
            <span className="text-xs text-blue-200 hidden sm:block">출처: 한국부동산원 청약홈</span>
          </div>
        </div>
      </header>

      {/* Tab Nav */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex flex-col items-start px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-xs font-normal mt-0.5 ${activeTab === tab.id ? 'text-blue-400' : 'text-slate-400'}`}>
                  {tab.sub}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'announcements' && <AnnouncementTab />}
        {activeTab === 'competition'   && <CompetitionTab />}
        {activeTab === 'winners'       && <WinnersTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-12 py-6">
        <p className="text-center text-xs text-slate-400">
          데이터 출처: 공공데이터포털 청약홈 OpenAPI · 한국부동산원
        </p>
      </footer>
    </div>
  )
}
