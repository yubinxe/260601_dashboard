/* 청약 대시보드 — mock data (realistic Korean public-housing subscription data)
   Attached to window.DATA. All figures are illustrative. */
(function () {
  // status: 'open' 접수중 · 'soon' 마감 임박 · 'upcoming' 접수 예정 · 'closed' 마감
  const announcements = [
    {
      id: "2026000412", name: "올림픽파크 라브이엘", builder: "현대건설",
      sido: "서울", gu: "강동구", type: "민영", post: "2026.05.28",
      open: "2026.06.03", close: "2026.06.05", moveIn: "2028.11",
      units: 1242, price: 13.8, area: "59·84㎡", status: "soon", dday: 4,
      avgComp: 48.2,
    },
    {
      id: "2026000408", name: "마곡 그랑 센트럴", builder: "GS건설",
      sido: "서울", gu: "강서구", type: "민영", post: "2026.05.26",
      open: "2026.06.02", close: "2026.06.04", moveIn: "2028.09",
      units: 868, price: 11.2, area: "74·84㎡", status: "soon", dday: 3,
      avgComp: 36.7,
    },
    {
      id: "2026000401", name: "위례 헤리티지 자이", builder: "GS건설",
      sido: "경기", gu: "하남시", type: "민영", post: "2026.05.22",
      open: "2026.06.09", close: "2026.06.11", moveIn: "2028.12",
      units: 1530, price: 9.6, area: "59·84·101㎡", status: "open", dday: 10,
      avgComp: 27.4,
    },
    {
      id: "2026000397", name: "광교 더샵 레이크파크", builder: "포스코이앤씨",
      sido: "경기", gu: "수원시", type: "민영", post: "2026.05.20",
      open: "2026.06.10", close: "2026.06.12", moveIn: "2029.03",
      units: 742, price: 8.4, area: "84·110㎡", status: "open", dday: 11,
      avgComp: 19.1,
    },
    {
      id: "2026000390", name: "송도 아메리칸타운 포레", builder: "대우건설",
      sido: "인천", gu: "연수구", type: "민영", post: "2026.05.18",
      open: "2026.06.16", close: "2026.06.18", moveIn: "2029.05",
      units: 2104, price: 6.9, area: "59·84㎡", status: "upcoming", dday: 17,
      avgComp: 14.8,
    },
    {
      id: "2026000386", name: "동탄 레이크자이 더테라스", builder: "GS건설",
      sido: "경기", gu: "화성시", type: "민영", post: "2026.05.15",
      open: "2026.06.17", close: "2026.06.19", moveIn: "2029.02",
      units: 1188, price: 7.3, area: "84·99㎡", status: "upcoming", dday: 18,
      avgComp: 22.5,
    },
    {
      id: "2026000372", name: "청량리 스카이 엘디움", builder: "롯데건설",
      sido: "서울", gu: "동대문구", type: "민영", post: "2026.05.08",
      open: "2026.05.20", close: "2026.05.22", moveIn: "2028.08",
      units: 564, price: 12.6, area: "59·84㎡", status: "closed", dday: -10,
      avgComp: 64.3,
    },
    {
      id: "2026000365", name: "검단신도시 우미린 클래스", builder: "우미건설",
      sido: "인천", gu: "서구", type: "민영", post: "2026.05.06",
      open: "2026.05.19", close: "2026.05.21", moveIn: "2028.10",
      units: 996, price: 5.8, area: "84㎡", status: "closed", dday: -11,
      avgComp: 9.2,
    },
    {
      id: "2026000358", name: "운정 푸르지오 파크라인", builder: "대우건설",
      sido: "경기", gu: "파주시", type: "민영", post: "2026.05.02",
      open: "2026.05.13", close: "2026.05.15", moveIn: "2028.07",
      units: 1320, price: 5.2, area: "74·84㎡", status: "closed", dday: -17,
      avgComp: 6.4,
    },
    {
      id: "2026000351", name: "힐스테이트 과천청사", builder: "현대엔지니어링",
      sido: "경기", gu: "과천시", type: "민영", post: "2026.04.28",
      open: "2026.05.12", close: "2026.05.14", moveIn: "2028.06",
      units: 480, price: 15.4, area: "59·84㎡", status: "closed", dday: -18,
      avgComp: 121.7,
    },
  ];

  // 경쟁률 — 단지별 평균/최고 + 특별공급 유형 분해
  const competition = [
    { name: "힐스테이트 과천청사", sido: "경기", avg: 121.7, top: 412.0, general: 88.4 },
    { name: "청량리 스카이 엘디움", sido: "서울", avg: 64.3, top: 198.0, general: 52.1 },
    { name: "올림픽파크 라브이엘", sido: "서울", avg: 48.2, top: 156.0, general: 39.8 },
    { name: "마곡 그랑 센트럴", sido: "서울", avg: 36.7, top: 121.0, general: 30.2 },
    { name: "위례 헤리티지 자이", sido: "경기", avg: 27.4, top: 92.0, general: 22.0 },
    { name: "동탄 레이크자이", sido: "경기", avg: 22.5, top: 71.0, general: 18.4 },
    { name: "광교 더샵 레이크파크", sido: "경기", avg: 19.1, top: 58.0, general: 15.6 },
    { name: "송도 아메리칸타운", sido: "인천", avg: 14.8, top: 44.0, general: 11.9 },
  ];

  // 특별공급 유형별 현황 (전체 합산)
  const specialSupply = [
    { type: "신혼부부", supply: 1840, apply: 38520, comp: 20.9 },
    { type: "생애최초", supply: 1310, apply: 41280, comp: 31.5 },
    { type: "다자녀가구", supply: 760, apply: 8940, comp: 11.8 },
    { type: "노부모부양", supply: 320, apply: 3120, comp: 9.8 },
    { type: "기관추천", supply: 540, apply: 4860, comp: 9.0 },
    { type: "일반공급", supply: 4290, apply: 162400, comp: 37.9 },
  ];

  // 당첨자 통계
  const ageGroups = [
    { label: "20대", pct: 8.4 },
    { label: "30대", pct: 41.2 },
    { label: "40대", pct: 29.6 },
    { label: "50대", pct: 14.1 },
    { label: "60대+", pct: 6.7 },
  ];

  const scoreStats = { avg: 62.4, max: 79, min: 41, prevAvg: 58.9 };

  // 청약 가점 분포 (구간별 당첨자 비중)
  const scoreDist = [
    { band: "30–39", pct: 4.2 },
    { band: "40–49", pct: 11.8 },
    { band: "50–59", pct: 26.4 },
    { band: "60–69", pct: 38.1 },
    { band: "70–84", pct: 19.5 },
  ];

  // 지역별 경쟁률 히트맵 (시도 × 면적타입)
  const heatmap = {
    cols: ["59㎡", "74㎡", "84㎡", "101㎡+"],
    rows: [
      { region: "서울", values: [72.4, 51.2, 48.6, 39.1] },
      { region: "경기", values: [33.8, 27.5, 24.2, 18.6] },
      { region: "인천", values: [16.4, 13.1, 11.8, 8.2] },
      { region: "부산", values: [21.7, 18.0, 14.9, 10.4] },
      { region: "대전", values: [12.9, 9.6, 7.8, 5.1] },
    ],
  };

  // 헤더 KPI
  const kpi = {
    openCount: 4,
    soonCount: 2,
    totalUnits: 11034,
    avgComp: 36.2,
    updated: "방금",
  };

  window.DATA = {
    announcements, competition, specialSupply,
    ageGroups, scoreStats, scoreDist, heatmap, kpi,
  };
})();
