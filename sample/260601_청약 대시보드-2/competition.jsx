/* competition.jsx — 경쟁률 현황 탭 */
function CompetitionTab() {
  const { competition, specialSupply, kpi } = window.DATA;
  const maxComp = Math.max(...specialSupply.map((s) => s.comp));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      {/* ranked bars */}
      <Card>
        <CardHead title="단지별 평균 경쟁률" sub="최근 분양 단지 · 1순위 평균 경쟁률 기준"
          right={<div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-3)", fontWeight: 500 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--accent)" }} />최고 경쟁 단지
          </div>} />
        <RankedBars items={competition} accessor={(d) => d.avg} unit=":1" fmt={(v) => v.toFixed(1)} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "var(--gap)" }} className="comp-grid">
        {/* special supply table */}
        <Card>
          <CardHead title="특별공급 유형별 현황" sub="전체 단지 합산 · 공급 대비 접수" />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 84px", padding: "0 4px 12px", fontSize: 12, fontWeight: 650, color: "var(--ink-3)" }}>
              <div>유형</div><div style={{ textAlign: "right" }}>공급</div><div style={{ textAlign: "right" }}>접수</div><div style={{ textAlign: "right" }}>경쟁률</div>
            </div>
            {specialSupply.map((s, i) => (
              <div key={s.type} style={{
                display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 84px", alignItems: "center",
                padding: "13px 4px", borderTop: "1px solid var(--line)",
                animation: `fadeIn .5s ease ${i * 50}ms both`,
              }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: "var(--ink)" }}>{s.type}</div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 14, color: "var(--ink-2)" }}>{s.supply.toLocaleString()}</div>
                <div className="tnum" style={{ textAlign: "right", fontSize: 14, color: "var(--ink-2)" }}>{s.apply.toLocaleString()}</div>
                <div className="tnum" style={{ textAlign: "right" }}>
                  <span style={{
                    display: "inline-block", padding: "3px 9px", borderRadius: 8, whiteSpace: "nowrap",
                    background: `color-mix(in oklch, var(--accent), var(--bg) ${Math.round(92 - (s.comp / maxComp) * 60)}%)`,
                    fontSize: 13.5, fontWeight: 700, color: s.comp / maxComp > 0.7 ? "#fff" : "var(--ink)",
                  }}>{s.comp}<span style={{ fontSize: 10.5, fontWeight: 500 }}>:1</span></span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* insight panel */}
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <CardHead title="경쟁 인사이트" sub="이번 분양 사이클 요약" />
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
            <InsightStat label="전체 평균 경쟁률" value={kpi.avgComp} unit=":1" accent
              note="전월 대비 +5.8 상승" />
            <InsightStat label="최고 경쟁 유형" value="일반공급" sub="37.9:1" textValue
              note="생애최초 31.5:1 · 신혼부부 20.9:1" />
            <InsightStat label="가장 치열한 면적" value="59㎡" sub="소형 선호 지속" textValue
              note="서울 59㎡ 평균 72.4:1" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function InsightStat({ label, value, unit, sub, note, accent, textValue }) {
  return (
    <div style={{ padding: "18px 20px", borderRadius: "var(--r-md)", background: "var(--surface-2)", border: "1px solid var(--line)" }}>
      <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 550, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: textValue ? 26 : 34, fontWeight: 750, letterSpacing: "-0.03em", color: accent ? "var(--accent)" : "var(--ink)", whiteSpace: "nowrap" }}>
          {textValue ? value : <CountUp value={value} decimals={1} />}{unit && <span style={{ fontSize: 16, fontWeight: 600, color: "var(--ink-3)" }}>{unit}</span>}
        </span>
        {sub && <span style={{ fontSize: 14, fontWeight: 650, color: "var(--ink-2)" }}>{sub}</span>}
      </div>
      {note && <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 7, fontWeight: 450 }}>{note}</div>}
    </div>
  );
}

window.CompetitionTab = CompetitionTab;
