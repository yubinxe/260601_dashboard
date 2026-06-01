/* announcements.jsx — 분양정보 탭: 필터 + 공고 테이블 */
const { useState: useStateA, useMemo } = React;

function FilterChip({ active, onClick, children, count }) {
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "8px 15px", borderRadius: 99, border: "1px solid",
      borderColor: active ? "transparent" : "var(--line)",
      background: active ? "var(--ink)" : "var(--surface)",
      color: active ? "var(--bg)" : "var(--ink-2)",
      fontSize: 13.5, fontWeight: 600, transition: "all .25s var(--ease)", whiteSpace: "nowrap",
    }}>
      {children}
      {count != null && <span style={{
        fontSize: 11.5, fontWeight: 700, padding: "1px 7px", borderRadius: 99,
        background: active ? "rgba(255,255,255,.18)" : "var(--track)",
        color: active ? "var(--bg)" : "var(--ink-3)",
      }}>{count}</span>}
    </button>
  );
}

function Select({ value, onChange, options }) {
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{
        appearance: "none", WebkitAppearance: "none",
        padding: "9px 38px 9px 15px", borderRadius: 12,
        border: "1px solid var(--line)", background: "var(--surface)",
        color: "var(--ink)", fontSize: 13.5, fontWeight: 600, fontFamily: "inherit",
        cursor: "pointer", letterSpacing: "-0.01em",
      }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--ink-3)", display: "flex" }}>
        <Icon name="chevron" size={16} />
      </span>
    </div>
  );
}

function AnnouncementsTab() {
  const { announcements } = window.DATA;
  const [region, setRegion] = useStateA("전체 지역");
  const [status, setStatus] = useStateA("all");
  const [q, setQ] = useStateA("");
  const [sortKey, setSortKey] = useStateA("dday");

  const regions = ["전체 지역", "서울", "경기", "인천"];
  const counts = useMemo(() => ({
    all: announcements.length,
    open: announcements.filter((a) => a.status === "open").length,
    soon: announcements.filter((a) => a.status === "soon").length,
    upcoming: announcements.filter((a) => a.status === "upcoming").length,
    closed: announcements.filter((a) => a.status === "closed").length,
  }), [announcements]);

  const rows = useMemo(() => {
    let r = announcements.slice();
    if (region !== "전체 지역") r = r.filter((a) => a.sido === region);
    if (status !== "all") r = r.filter((a) => a.status === status);
    if (q.trim()) r = r.filter((a) => (a.name + a.gu + a.builder).toLowerCase().includes(q.trim().toLowerCase()));
    const order = { soon: 0, open: 1, upcoming: 2, closed: 3 };
    if (sortKey === "dday") r.sort((a, b) => order[a.status] - order[b.status] || a.dday - b.dday);
    if (sortKey === "comp") r.sort((a, b) => b.avgComp - a.avgComp);
    if (sortKey === "price") r.sort((a, b) => b.price - a.price);
    return r;
  }, [announcements, region, status, q, sortKey]);

  const statusFilters = [
    ["all", "전체"], ["soon", "마감 임박"], ["open", "접수중"], ["upcoming", "접수 예정"], ["closed", "마감"],
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      {/* filter bar */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {statusFilters.map(([k, label]) => (
              <FilterChip key={k} active={status === k} onClick={() => setStatus(k)} count={counts[k]}>{label}</FilterChip>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Select value={region} onChange={setRegion} options={regions} />
            <Select value={sortKey === "dday" ? "마감순" : sortKey === "comp" ? "경쟁률순" : "분양가순"}
              onChange={(v) => setSortKey(v === "마감순" ? "dday" : v === "경쟁률순" ? "comp" : "price")}
              options={["마감순", "경쟁률순", "분양가순"]} />
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <span style={{ position: "absolute", left: 13, color: "var(--ink-3)", display: "flex" }}><Icon name="search" size={16} /></span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="단지·지역 검색" style={{
                padding: "9px 14px 9px 38px", borderRadius: 12, border: "1px solid var(--line)",
                background: "var(--surface)", color: "var(--ink)", fontSize: 13.5, fontFamily: "inherit",
                width: 180, fontWeight: 500, outline: "none",
              }} />
            </div>
          </div>
        </div>
      </Card>

      {/* table */}
      <Card pad={false} style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 880 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)" }}>
                {["주택명 / 시공사", "공급지역", "상태", "청약기간", "분양세대", "평균 경쟁률", "분양가(평)", "입주예정"].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i >= 4 && i <= 6 ? "right" : "left", padding: "16px 22px",
                    fontSize: 12, fontWeight: 650, color: "var(--ink-3)", letterSpacing: "0.02em",
                    whiteSpace: "nowrap", position: "sticky", top: 0, background: "var(--surface-2)",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((a, i) => (
                <tr key={a.id} className="rowhover" style={{
                  borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--line)",
                  animation: `fadeIn .5s ease ${i * 35}ms both`,
                }}>
                  <td style={{ padding: "15px 22px" }}>
                    <div style={{ fontSize: 15, fontWeight: 650, color: "var(--ink)", letterSpacing: "-0.01em" }}>{a.name}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 3 }}>{a.builder} · {a.type} · {a.area}</div>
                  </td>
                  <td style={{ padding: "15px 22px", fontSize: 14, color: "var(--ink-2)", whiteSpace: "nowrap" }}>{a.sido} {a.gu}</td>
                  <td style={{ padding: "15px 22px" }}>
                    <StatusPill status={a.status} pulse={a.status === "soon"} />
                    {a.status === "soon" && <div style={{ fontSize: 12, fontWeight: 700, color: "var(--hot)", marginTop: 5 }}>D-{a.dday}</div>}
                  </td>
                  <td style={{ padding: "15px 22px", fontSize: 13.5, color: "var(--ink-2)", whiteSpace: "nowrap" }} className="tnum">{a.open}<span style={{ color: "var(--ink-3)" }}> ~ {a.close.slice(5)}</span></td>
                  <td style={{ padding: "15px 22px", textAlign: "right", fontSize: 14, fontWeight: 600, color: "var(--ink)" }} className="tnum">{a.units.toLocaleString()}</td>
                  <td style={{ padding: "15px 22px", textAlign: "right" }} className="tnum">
                    <span style={{ fontSize: 14.5, fontWeight: 700, color: a.avgComp >= 50 ? "var(--hot)" : "var(--ink)" }}>{a.avgComp}</span>
                    <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>:1</span>
                  </td>
                  <td style={{ padding: "15px 22px", textAlign: "right", fontSize: 14, fontWeight: 600, color: "var(--ink)" }} className="tnum">{a.price}억</td>
                  <td style={{ padding: "15px 22px", fontSize: 13.5, color: "var(--ink-2)", whiteSpace: "nowrap" }} className="tnum">{a.moveIn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--ink-3)", fontSize: 14 }}>조건에 맞는 공고가 없습니다.</div>
        )}
      </Card>
    </div>
  );
}

window.AnnouncementsTab = AnnouncementsTab;
