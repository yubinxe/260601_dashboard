/* charts.jsx — bespoke, Apple-clean data viz. Exports to window. */
const { useState, useEffect, useRef } = React;

/* fire a callback once the element scrolls into view (for bar grow-in) */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);
  return [ref, seen];
}

/* Horizontal ranked bars — 단지별 경쟁률 */
function RankedBars({ items, max, accessor, fmt, unit }) {
  const [ref, seen] = useInView();
  const top = max || Math.max(...items.map(accessor));
  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {items.map((it, i) => {
        const v = accessor(it);
        const w = Math.max(2, (v / top) * 100);
        return (
          <div key={it.name} style={{ display: "grid", gridTemplateColumns: "150px 1fr 78px", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 550, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.name}</div>
            <div style={{ position: "relative", height: 30, borderRadius: 8, background: "var(--track)", overflow: "hidden" }}>
              <div style={{
                position: "absolute", inset: 0, transformOrigin: "left center",
                transform: seen ? "scaleX(1)" : "scaleX(0)",
                transition: `transform 0.9s var(--ease-out) ${i * 70}ms`,
                width: w + "%",
                borderRadius: 8,
                background: i === 0
                  ? "linear-gradient(90deg, var(--accent), color-mix(in oklch, var(--accent), #fff 22%))"
                  : "color-mix(in oklch, var(--accent), var(--bg) 58%)",
              }} />
            </div>
            <div className="tnum" style={{ fontSize: 15, fontWeight: 650, textAlign: "right", color: "var(--ink)", whiteSpace: "nowrap" }}>
              {fmt ? fmt(v) : v}<span style={{ fontSize: 11, fontWeight: 500, color: "var(--ink-3)", marginLeft: 2 }}>{unit}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Vertical bars — 연령대별 당첨자 (with axis + gridlines for legibility) */
function ColumnBars({ items }) {
  const [ref, seen] = useInView();
  const top = Math.max(...items.map((d) => d.pct));
  const axisMax = Math.ceil(top / 10) * 10;            // 41.2 -> 50
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(axisMax * f));
  const CHART_H = 244;
  return (
    <div ref={ref}>
      <div style={{ display: "flex", gap: 14 }}>
        {/* y axis */}
        <div style={{ width: 26, height: CHART_H, position: "relative" }}>
          {ticks.map((v) => (
            <div key={v} className="tnum" style={{
              position: "absolute", bottom: `${(v / axisMax) * 100}%`, right: 0,
              transform: "translateY(50%)", fontSize: 11, color: "var(--ink-3)", fontWeight: 500,
            }}>{v}</div>
          ))}
        </div>
        {/* plot */}
        <div style={{ flex: 1, position: "relative", height: CHART_H }}>
          {ticks.map((v, i) => (
            <div key={v} style={{
              position: "absolute", left: 0, right: 0, bottom: `${(v / axisMax) * 100}%`, height: 1,
              background: i === 0 ? "var(--line-strong)" : "var(--line)",
            }} />
          ))}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "space-around", gap: 18 }}>
            {items.map((d, i) => {
              const h = (d.pct / axisMax) * 100;
              const peak = d.pct === top;
              return (
                <div key={d.label} style={{ flex: 1, maxWidth: 74, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                  <div className="tnum" style={{
                    fontSize: 14.5, fontWeight: 750, marginBottom: 9, letterSpacing: "-0.02em",
                    color: peak ? "var(--accent)" : "var(--ink)",
                    opacity: seen ? 1 : 0, transition: `opacity .5s ease ${i * 80 + 500}ms`,
                  }}>{d.pct}<span style={{ fontSize: 10.5, fontWeight: 600, color: "var(--ink-3)" }}>%</span></div>
                  <div style={{
                    width: "100%", height: seen ? `${h}%` : 0, minHeight: seen ? 4 : 0,
                    borderRadius: "8px 8px 2px 2px",
                    background: peak
                      ? "linear-gradient(180deg, var(--accent), color-mix(in oklch, var(--accent), #fff 14%))"
                      : "color-mix(in oklch, var(--accent), var(--surface) 30%)",
                    boxShadow: peak ? "0 6px 18px -4px color-mix(in oklch, var(--accent), transparent 50%)" : "none",
                    transition: `height .9s var(--ease-out) ${i * 80}ms`,
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* x labels */}
      <div style={{ display: "flex", gap: 14, marginTop: 12 }}>
        <div style={{ width: 26 }} />
        <div style={{ flex: 1, display: "flex", justifyContent: "space-around", gap: 18 }}>
          {items.map((d) => {
            const peak = d.pct === top;
            return (
              <div key={d.label} style={{ flex: 1, maxWidth: 74, textAlign: "center", fontSize: 13, fontWeight: peak ? 700 : 550, color: peak ? "var(--ink)" : "var(--ink-2)" }}>{d.label}</div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* Stacked distribution strip — 가점 분포 */
function DistStrip({ items }) {
  const [ref, seen] = useInView();
  return (
    <div ref={ref}>
      <div style={{ display: "flex", height: 14, borderRadius: 99, overflow: "hidden", background: "var(--track)" }}>
        {items.map((d, i) => (
          <div key={d.band} style={{
            width: seen ? `${d.pct}%` : "0%",
            transition: `width 0.9s var(--ease-out) ${i * 90}ms`,
            background: `color-mix(in oklch, var(--accent), var(--bg) ${62 - i * 14}%)`,
          }} />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 20px", marginTop: 18 }}>
        {items.map((d, i) => (
          <div key={d.band} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: `color-mix(in oklch, var(--accent), var(--bg) ${62 - i * 14}%)` }} />
            <span style={{ fontSize: 13, color: "var(--ink-2)", fontWeight: 500 }}>{d.band}점</span>
            <span className="tnum" style={{ fontSize: 13, color: "var(--ink)", fontWeight: 650 }}>{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Heatmap — 지역 × 면적 경쟁률 (discrete bins + legend + max highlight) */
function Heatmap({ data }) {
  const [ref, seen] = useInView();
  const all = data.rows.flatMap((r) => r.values);
  const max = Math.max(...all);
  const thresholds = [8, 15, 25, 50];                 // -> 5 bins
  const labels = ["~8", "8–15", "15–25", "25–50", "50+"];
  const mix = [88, 70, 48, 24, 0];                    // % surface mixed into accent
  const stepOf = (v) => thresholds.reduce((s, t) => s + (v >= t ? 1 : 0), 0);
  const swatch = (s) => (s === 4 ? "var(--accent)" : `color-mix(in oklch, var(--accent), var(--surface) ${mix[s]}%)`);
  return (
    <div ref={ref}>
      <div style={{ display: "grid", gridTemplateColumns: `64px repeat(${data.cols.length}, 1fr)`, gap: 8 }}>
        <div />
        {data.cols.map((c) => (
          <div key={c} style={{ fontSize: 12.5, fontWeight: 650, color: "var(--ink-2)", textAlign: "center", paddingBottom: 6 }}>{c}</div>
        ))}
        {data.rows.map((row, ri) => (
          <React.Fragment key={row.region}>
            <div style={{ fontSize: 13.5, fontWeight: 650, color: "var(--ink)", display: "flex", alignItems: "center" }}>{row.region}</div>
            {row.values.map((v, ci) => {
              const s = stepOf(v);
              const ink = s >= 3 ? "#fff" : "var(--ink)";
              const sub = s >= 3 ? "rgba(255,255,255,0.72)" : "var(--ink-3)";
              const isMax = v === max;
              return (
                <div key={ci} style={{
                  position: "relative", height: 58, borderRadius: 13,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  background: swatch(s), color: ink,
                  boxShadow: isMax ? "0 0 0 3px var(--surface), 0 0 0 5px var(--ink), 0 10px 22px -6px color-mix(in oklch, var(--accent), transparent 45%)" : "none",
                  zIndex: isMax ? 2 : 1,
                  opacity: seen ? 1 : 0, transform: seen ? "scale(1)" : "scale(0.92)",
                  transition: `opacity .5s ease ${(ri * data.cols.length + ci) * 28}ms, transform .5s var(--ease-out) ${(ri * data.cols.length + ci) * 28}ms`,
                }}>
                  <span className="tnum" style={{ fontSize: 16.5, fontWeight: 750, letterSpacing: "-0.02em", lineHeight: 1 }}>{v}</span>
                  <span className="tnum" style={{ fontSize: 10, fontWeight: 600, color: sub, marginTop: 3 }}>: 1</span>
                  {isMax && (
                    <span style={{ position: "absolute", top: 6, right: 7, fontSize: 8.5, fontWeight: 800, color: ink, letterSpacing: "0.06em", opacity: 0.92 }}>최고</span>
                  )}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      {/* legend */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 16px", marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--line)" }}>
        <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 650 }}>경쟁률 구간 (n:1)</span>
        {labels.map((lab, i) => (
          <div key={lab} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 15, height: 15, borderRadius: 5, background: swatch(i), border: "1px solid var(--line)" }} />
            <span className="tnum" style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600 }}>{lab}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Animated count-up number */
function CountUp({ value, decimals = 0, dur = 1100 }) {
  const [n, setN] = useState(0);
  const [ref, seen] = useInView();
  useEffect(() => {
    if (!seen) return;
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setN(value * e);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen, value, dur]);
  return <span ref={ref} className="tnum">{n.toLocaleString("ko-KR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
}

Object.assign(window, { RankedBars, ColumnBars, DistStrip, Heatmap, CountUp, useInView });
