/* winners.jsx — 당첨자 통계 탭 */
function WinnersTab() {
  const { ageGroups, scoreStats, scoreDist, heatmap } = window.DATA;
  const diff = (scoreStats.avg - scoreStats.prevAvg).toFixed(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
      {/* score stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gap)" }} className="score-grid">
        <ScoreCard label="평균 청약 가점" value={scoreStats.avg} decimals={1} accent
          foot={<span style={{ color: "var(--pos)", fontWeight: 650 }}>▲ {diff}점 <span style={{ color: "var(--ink-3)", fontWeight: 450 }}>전 분기 대비</span></span>} />
        <ScoreCard label="당첨 최고 가점" value={scoreStats.max} foot={<span style={{ color: "var(--ink-3)" }}>만점 84점 기준 · 무주택 15년+</span>} />
        <ScoreCard label="당첨 최저 가점(커트라인)" value={scoreStats.min} foot={<span style={{ color: "var(--ink-3)" }}>비인기 면적·잔여세대 기준</span>} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap)" }} className="win-grid">
        {/* age groups */}
        <Card>
          <CardHead title="연령대별 당첨자 분포" sub="전체 당첨자 기준 · 30대 비중 최고" />
          <ColumnBars items={ageGroups} />
        </Card>

        {/* score distribution */}
        <Card>
          <CardHead title="가점 구간별 당첨 비중" sub="당첨자 가점 분포" />
          <div style={{ marginTop: 30 }}>
            <DistStrip items={scoreDist} />
          </div>
          <div style={{ marginTop: 26, padding: "16px 18px", borderRadius: "var(--r-md)", background: "var(--accent-soft)", fontSize: 13.5, color: "var(--ink-2)", fontWeight: 500, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 700, color: "var(--ink)" }}>60–69점 구간이 38.1%</span>로 가장 두텁습니다. 50점 이하 당첨은 비인기 면적에 집중됐어요.
          </div>
        </Card>
      </div>

      {/* heatmap */}
      <Card>
        <CardHead title="지역 × 면적 경쟁률 히트맵" sub="시도별 · 전용면적 구간별 평균 경쟁률" />
        <Heatmap data={heatmap} />
      </Card>
    </div>
  );
}

function ScoreCard({ label, value, decimals = 0, accent, foot }) {
  return (
    <Card>
      <div style={{ fontSize: 13.5, color: "var(--ink-3)", fontWeight: 550 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 12 }}>
        <span style={{ fontSize: 46, fontWeight: 760, letterSpacing: "-0.04em", color: accent ? "var(--accent)" : "var(--ink)", lineHeight: 1 }}>
          <CountUp value={value} decimals={decimals} />
        </span>
        <span style={{ fontSize: 18, fontWeight: 600, color: "var(--ink-3)" }}>점</span>
      </div>
      <div style={{ fontSize: 12.5, marginTop: 14, fontWeight: 450 }}>{foot}</div>
    </Card>
  );
}

window.WinnersTab = WinnersTab;
