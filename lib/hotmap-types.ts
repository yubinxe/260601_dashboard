export interface HotmapRegion {
  code: string
  name: string
  x: number
  y: number
  avgComp: number
  specialComp: number
  supplyUnits: number
  projectCount: number
  heat: 0 | 1 | 2 | 3 | 4
}

export interface HotmapSpot {
  id: string
  pblancNo: string
  name: string
  regionCode: string
  regionName: string
  address: string
  builder: string
  units: number
  compRate: number
  specialComp: number
  status: string
  nspc: string
  x: number
  y: number
  openDate: string
  closeDate: string
}

export interface HotmapPayload {
  statMonth: string
  regions: HotmapRegion[]
  hotspots: HotmapSpot[]
  nationalAvg: number
}
