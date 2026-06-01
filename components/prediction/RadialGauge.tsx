'use client'

import { useEffect, useState } from 'react'

export default function RadialGauge({
  value,
  label,
  sublabel,
}: {
  value: number
  label: string
  sublabel?: string
}) {
  const [animated, setAnimated] = useState(0)
  const clamped = Math.min(100, Math.max(0, value))
  const r = 88
  const c = 2 * Math.PI * r
  const offset = c - (animated / 100) * c

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(clamped))
    return () => cancelAnimationFrame(t)
  }, [clamped])

  return (
    <div className="radial-gauge" role="img" aria-label={`${label} ${Math.round(clamped)}퍼센트`}>
      <svg width="220" height="220" viewBox="0 0 220 220">
        <circle cx="110" cy="110" r={r} fill="none" stroke="var(--track)" strokeWidth="14" />
        <circle
          cx="110"
          cy="110"
          r={r}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 110 110)"
          style={{ transition: 'stroke-dashoffset 1.1s var(--ease-out)' }}
        />
      </svg>
      <div className="radial-gauge-center">
        <div className="radial-gauge-value tnum">{Math.round(animated)}%</div>
        <div className="radial-gauge-label">{label}</div>
        {sublabel && <div className="radial-gauge-sub">{sublabel}</div>}
      </div>
    </div>
  )
}
