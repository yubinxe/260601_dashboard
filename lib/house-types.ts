import type { Announcement } from '@/lib/types'

/** 청약홈 HOUSE_DTL_SECD — 민영·국민 구분 (실 API 기준) */

export const HOUSE_TYPE_ALL = ''

/** 민영주택 */
export const HOUSE_TYPE_PRIVATE = '01'

/** 국민주택 (공공분양·국민 등) — API에서 02가 아닌 03 */
export const HOUSE_TYPE_PUBLIC = '03'

export const HOUSE_TYPE_OPTIONS = [
  { value: HOUSE_TYPE_ALL, label: '전체' },
  { value: HOUSE_TYPE_PRIVATE, label: '민영' },
  { value: HOUSE_TYPE_PUBLIC, label: '국민' },
] as const

export type HouseTypeFilter = (typeof HOUSE_TYPE_OPTIONS)[number]['value']

export function matchesHouseTypeFilter(
  item: Announcement,
  houseType: string,
): boolean {
  if (!houseType) return true

  const dtl = item.HOUSE_DTL_SECD ?? ''
  const nm = `${item.HOUSE_DTL_SECD_NM ?? ''}${item.HOUSE_SECD_NM ?? ''}`

  if (houseType === HOUSE_TYPE_PRIVATE) {
    return dtl === HOUSE_TYPE_PRIVATE || nm.includes('민영')
  }
  if (houseType === HOUSE_TYPE_PUBLIC) {
    return dtl === HOUSE_TYPE_PUBLIC || nm.includes('국민')
  }
  return true
}
