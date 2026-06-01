/** 청약홈 HOUSE_DTL_SECD — 민영·국민 구분 */

export const HOUSE_TYPE_ALL = ''

/** 민영주택 */
export const HOUSE_TYPE_PRIVATE = '01'

/** 국민주택 */
export const HOUSE_TYPE_PUBLIC = '02'

export const HOUSE_TYPE_OPTIONS = [
  { value: HOUSE_TYPE_ALL, label: '전체' },
  { value: HOUSE_TYPE_PRIVATE, label: '민영' },
  { value: HOUSE_TYPE_PUBLIC, label: '국민' },
] as const

export type HouseTypeFilter = (typeof HOUSE_TYPE_OPTIONS)[number]['value']
