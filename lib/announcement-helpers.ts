import type { Announcement } from './types'

export type SubscriptionStatus = 'open' | 'soon' | 'upcoming' | 'closed'

/** 마감 임박 기준: 접수 마감일까지 남은 일수 */
export const CLOSING_SOON_DAYS = 5

export interface HeroAnnouncement {
  id: string
  name: string
  builder: string
  sido: string
  gu: string
  open: string
  close: string
  units: number
  status: SubscriptionStatus
  dday: number
}

export interface DashboardKpi {
  openCount: number
  soonCount: number
  totalUnits: number
  updated: string
}

function parseYmd(raw: string): Date | null {
  if (!raw) return null
  const s = raw.replace(/-/g, '').slice(0, 8)
  if (s.length < 8) return null
  const y = Number(s.slice(0, 4))
  const m = Number(s.slice(4, 6)) - 1
  const d = Number(s.slice(6, 8))
  const date = new Date(y, m, d)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function daysBetween(from: Date, to: Date) {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime()
  return Math.round(ms / 86400000)
}

export function getSubscriptionStatus(ann: Announcement, today = new Date()): SubscriptionStatus {
  const open = parseYmd(ann.RCEPT_BGNDE)
  const close = parseYmd(ann.RCEPT_ENDDE)
  if (!open || !close) return 'closed'

  const t = startOfDay(today)
  if (t < open) return 'upcoming'
  if (t > close) return 'closed'

  const remaining = daysBetween(t, close)
  return remaining <= CLOSING_SOON_DAYS ? 'soon' : 'open'
}

export function getDday(endRaw: string, today = new Date()): number {
  const close = parseYmd(endRaw)
  if (!close) return 0
  return daysBetween(startOfDay(today), close)
}

function formatYmdDisplay(raw: string) {
  const d = parseYmd(raw)
  if (!d) return raw || '-'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function splitRegion(areaName: string) {
  const parts = (areaName || '').trim().split(/\s+/)
  if (parts.length === 0) return { sido: '-', gu: '' }
  if (parts.length === 1) return { sido: parts[0], gu: '' }
  return { sido: parts[0], gu: parts.slice(1).join(' ') }
}

export function toHeroAnnouncement(ann: Announcement, today = new Date()): HeroAnnouncement {
  const { sido, gu } = splitRegion(ann.SUBSCRPT_AREA_CODE_NM)
  const status = getSubscriptionStatus(ann, today)
  return {
    id: ann.PBLANC_NO || ann.HOUSE_MANAGE_NO,
    name: ann.HOUSE_NM,
    builder: ann.BSNS_MBY_NM || '—',
    sido,
    gu,
    open: formatYmdDisplay(ann.RCEPT_BGNDE),
    close: formatYmdDisplay(ann.RCEPT_ENDDE),
    units: Number(ann.TOT_SUPLY_HSHLDCO) || 0,
    status,
    dday: getDday(ann.RCEPT_ENDDE, today),
  }
}

/** 접수 중이며 마감일이 days 이내인 분양 목록 */
export function getClosingSoonList(
  items: Announcement[],
  days = CLOSING_SOON_DAYS,
  today = new Date(),
): HeroAnnouncement[] {
  return items
    .map(a => toHeroAnnouncement(a, today))
    .filter(a => (a.status === 'open' || a.status === 'soon') && a.dday >= 0 && a.dday <= days)
    .sort((a, b) => a.dday - b.dday)
}

export function buildDashboardSummary(items: Announcement[], today = new Date()): {
  heroItems: HeroAnnouncement[]
  closingSoonItems: HeroAnnouncement[]
  kpi: DashboardKpi
} {
  const mapped = items.map(a => toHeroAnnouncement(a, today))
  const active = mapped.filter(a => a.status === 'open' || a.status === 'soon')
  active.sort((a, b) => a.dday - b.dday)

  const openCount = mapped.filter(a => a.status === 'open').length
  const closingSoonItems = getClosingSoonList(items, CLOSING_SOON_DAYS, today)
  const soonCount = closingSoonItems.length
  const totalUnits = mapped.reduce((s, a) => s + a.units, 0)

  return {
    heroItems: active.slice(0, 3),
    closingSoonItems,
    kpi: {
      openCount,
      soonCount,
      totalUnits,
      updated: new Intl.DateTimeFormat('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(today),
    },
  }
}
