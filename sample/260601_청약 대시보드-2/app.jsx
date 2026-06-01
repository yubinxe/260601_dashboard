/* app.jsx — shell, hero, tab orchestration, tweaks */
const { useEffect: useEffectApp, useState: useStateApp } = React;

const ACCENTS = {
  "#0071e3": { press: "#0058b9" }, // Apple Blue
  "#5856d6": { press: "#4744c4" }, // Apple Indigo
  "#a259d9": { press: "#8a45bf" }, // Apple Purple
  "#6e6e73": { press: "#55555a" }, // Graphite (monochrome)
};
const FONTS = {
  "Pretendard": '"Pretendard Variable", Pretendard, -apple-system, system-ui, sans-serif',
  "시스템": '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
  "명조": '"Noto Serif KR", "Pretendard Variable", serif',
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0071e3",
  "font": "Pretendard",
  "dark": false,
  "density": "regular"
}/*EDITMODE-END*/;

/* ---------- Hero: 마감 임박 ---------- */
function Hero({ items }) {
  const soon = items.filter((a) => a.status === "soon" || a.status === "open").slice(0, 3);
  return (
    <section style={{ marginBottom: "var(--gap)" }}>
      <div className="rise" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 12px", borderRadius: 99, background: "var(--hot-soft)", color: "var(--hot)", fontSize: 12.5, fontWeight: 700, marginBottom: 14, whiteSpace: "nowrap" }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--hot)", animation: "pulseDot 1.6s ease-in-out infinite" }} />
            지금 청약 가능
          </div>
          <h1 style={{ margin: 0, fontSize: 40, fontWeight: 760, letterSpacing: "-0.035em", lineHeight: 1.08, color: "var(--ink)" }}>
            놓치면 안 되는<br />이번 주 청약 일정
          </h1>
        </div>
        <p style={{ margin: 0, fontSize: 15, color: "var(--ink-2)", maxWidth: 280, lineHeight: 1.55, fontWeight: 450 }}>
          마감이 임박한 단지를 한눈에. 청약 기간과 평균 경쟁률을 확인하고 일정을 놓치지 마세요.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--gap)" }} className="hero-grid">
        {soon.map((a, i) => (
          <article key={a.id} className="hero-card rise" style={{
            animationDelay: `${i * 90 + 60}ms`,
            position: "relative", overflow: "hidden",
            background: "var(--surface)", border: "1px solid var(--line)",
            borderRadius: "var(--r-lg)", padding: "var(--pad-card)", boxShadow: "var(--shadow)",
            transition: "transform .4s var(--ease), box-shadow .4s var(--ease)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <StatusPill status={a.status} pulse={a.status === "soon"} />
              {a.status === "soon"
                ? <div style={{ textAlign: "right" }}>
                    <div className="tnum" style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.04em", color: "var(--hot)", lineHeight: 1, whiteSpace: "nowrap" }}>D-{a.dday}</div>
                  </div>
                : <div className="tnum" style={{ fontSize: 14, fontWeight: 650, color: "var(--ink-3)", whiteSpace: "nowrap" }}>D-{a.dday}</div>}
            </div>
            <h3 style={{ margin: "20px 0 6px", fontSize: 22, fontWeight: 720, letterSpacing: "-0.025em", color: "var(--ink)" }}>{a.name}</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--ink-3)", fontSize: 13.5, fontWeight: 500 }}>
              <Icon name="pin" size={14} />{a.sido} {a.gu} · {a.builder}
            </div>
            <div style={{ display: "flex", gap: 26, marginTop: 22, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
              <HeroStat label="청약 기간" value={`${a.open.slice(5)} ~ ${a.close.slice(5)}`} />
              <HeroStat label="평균 경쟁률" value={`${a.avgComp}:1`} hot={a.avgComp >= 50} />
              <HeroStat label="분양세대" value={a.units.toLocaleString()} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function HeroStat({ label, value, hot }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 550, marginBottom: 5, whiteSpace: "nowrap" }}>{label}</div>
      <div className="tnum" style={{ fontSize: 15, fontWeight: 700, color: hot ? "var(--hot)" : "var(--ink)", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>{value}</div>
    </div>
  );
}

/* ---------- KPI strip ---------- */
function KpiStrip({ kpi }) {
  const stats = [
    { label: "접수중", value: kpi.openCount, unit: "건", icon: "spark" },
    { label: "마감 임박", value: kpi.soonCount, unit: "건", icon: "clock", hot: true },
    { label: "총 공급세대", value: kpi.totalUnits, unit: "세대", icon: "home", big: true },
    { label: "평균 경쟁률", value: kpi.avgComp, unit: ":1", icon: "chart", dec: 1 },
  ];
  return (
    <div className="rise" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--gap)", marginBottom: "var(--gap)" }}>
      {stats.map((s) => (
        <div key={s.label} style={{
          background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "var(--r-md)",
          padding: "18px 22px", display: "flex", flexDirection: "column", gap: 10, boxShadow: "var(--shadow)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", color: s.hot ? "var(--hot)" : "var(--ink-3)" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-2)", whiteSpace: "nowrap" }}>{s.label}</span>
            <Icon name={s.icon} size={16} />
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 3, whiteSpace: "nowrap" }}>
            <span className="tnum" style={{ fontSize: 30, fontWeight: 770, letterSpacing: "-0.035em", color: s.hot ? "var(--hot)" : "var(--ink)" }}>
              <CountUp value={s.value} decimals={s.dec || 0} />
            </span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink-3)" }}>{s.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Tab nav ---------- */
function TabNav({ tab, setTab }) {
  const tabs = [
    { id: "ann", label: "분양정보", icon: "home" },
    { id: "comp", label: "경쟁률 현황", icon: "chart" },
    { id: "win", label: "당첨자 통계", icon: "users" },
  ];
  return (
    <div style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 14, background: "var(--bg-sub)", border: "1px solid var(--line)" }}>
      {tabs.map((t) => {
        const on = tab === t.id;
        return (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 10,
            border: "none", background: on ? "var(--surface)" : "transparent",
            color: on ? "var(--ink)" : "var(--ink-3)", fontSize: 14.5, fontWeight: 650,
            boxShadow: on ? "var(--shadow)" : "none", transition: "all .3s var(--ease)", letterSpacing: "-0.01em",
          }}>
            <Icon name={t.icon} size={17} />{t.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Header ---------- */
function Header({ updated, dark, onToggleTheme }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      background: "color-mix(in oklch, var(--bg), transparent 28%)",
      backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)",
      borderBottom: "1px solid var(--line)",
    }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--ink)", color: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="home" size={17} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 750, letterSpacing: "-0.03em", color: "var(--ink)", whiteSpace: "nowrap" }}>청약 인사이트</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: "var(--ink-3)", fontWeight: 500 }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--accent)" }} />최종 업데이트 {updated}
          </div>
          <button onClick={onToggleTheme} aria-label="테마 전환" style={{
            width: 34, height: 34, borderRadius: 99, border: "1px solid var(--line)",
            background: "var(--surface)", color: "var(--ink-2)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {dark
              ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" strokeLinecap="round"/></svg>
              : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5Z" strokeLinejoin="round"/></svg>}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ---------- App ---------- */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = useStateApp("ann");
  const { kpi, announcements } = window.DATA;

  useEffectApp(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", t.dark ? "dark" : "light");
    root.setAttribute("data-density", t.density);
    root.style.setProperty("--accent", t.accent);
    root.style.setProperty("--accent-press", (ACCENTS[t.accent] || {}).press || t.accent);
    root.style.setProperty("--accent-soft", `color-mix(in oklch, ${t.accent}, transparent 90%)`);
    root.style.setProperty("--font-sans", FONTS[t.font] || FONTS.Pretendard);
  }, [t]);

  return (
    <div>
      <Header updated={kpi.updated} dark={t.dark} onToggleTheme={() => setTweak("dark", !t.dark)} />
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "40px 32px 80px" }}>
        <Hero items={announcements} />
        <KpiStrip kpi={kpi} />
        <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 var(--gap)" }}>
          <TabNav tab={tab} setTab={setTab} />
        </div>
        <div key={tab} style={{ animation: "fadeIn .45s ease both" }}>
          {tab === "ann" && <AnnouncementsTab />}
          {tab === "comp" && <CompetitionTab />}
          {tab === "win" && <WinnersTab />}
        </div>
      </main>

      <TweaksPanel>
        <TweakSection label="컬러" />
        <TweakColor label="악센트" value={t.accent}
          options={Object.keys(ACCENTS)}
          onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="타이포그래피" />
        <TweakRadio label="폰트" value={t.font} options={Object.keys(FONTS)} onChange={(v) => setTweak("font", v)} />
        <TweakSection label="레이아웃" />
        <TweakRadio label="밀도" value={t.density} options={["compact", "regular", "comfy"]} onChange={(v) => setTweak("density", v)} />
        <TweakToggle label="다크 모드" value={t.dark} onChange={(v) => setTweak("dark", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
