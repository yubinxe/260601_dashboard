'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/ui'
import RadialGauge from '@/components/prediction/RadialGauge'
import {
  buildPrediction,
  calculateSubscriptionScore,
  DEFAULT_REFERENCE,
  type ReferenceStats,
  type ScoreInput,
  type PredictionResult,
} from '@/lib/subscription-score'

const STEPS = [
  { id: 'homeless', title: '무주택 기간', desc: '만 30세 이후 무주택 기간을 선택하세요 (2점/년, 최대 32점)' },
  { id: 'dependents', title: '부양가족', desc: '본인을 제외한 부양가족 수 (5점/인, 최대 35점)' },
  { id: 'account', title: '청약통장', desc: '통장 가입 후 경과 연수 (1점/년, 최대 17점)' },
] as const

const REGIONS = [
  { code: '', name: '전국 평균' },
  { code: '100', name: '서울' },
  { code: '410', name: '경기' },
  { code: '400', name: '인천' },
  { code: '600', name: '부산' },
  { code: '700', name: '대구' },
  { code: '500', name: '광주' },
  { code: '300', name: '대전' },
  { code: '680', name: '울산' },
]

interface Props {
  regionCode?: string
  regionName?: string
  complexName?: string
  compact?: boolean
  onClose?: () => void
}

export default function WinnerPredictionCalculator({
  regionCode = '',
  regionName,
  complexName,
  compact = false,
  onClose,
}: Props) {
  const [step, setStep] = useState(0)
  const [input, setInput] = useState<ScoreInput>({ homelessYears: 5, dependents: 2, accountYears: 7 })
  const [region, setRegion] = useState(regionCode)
  const [reference, setReference] = useState<ReferenceStats>(DEFAULT_REFERENCE)
  const [refLoading, setRefLoading] = useState(true)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [calculating, setCalculating] = useState(false)

  const loadReference = useCallback(async (code: string) => {
    setRefLoading(true)
    try {
      const res = await fetch(`/api/prediction/reference?region=${encodeURIComponent(code)}`)
      const data = await res.json()
      setReference({
        avg: data.avg,
        min: data.min,
        max: data.max,
        median: data.median,
        regionName: regionName || data.regionName,
        statMonth: data.statMonth,
        sampleCount: data.sampleCount,
      })
    } catch {
      setReference({ ...DEFAULT_REFERENCE, regionName: regionName || '전국' })
    } finally {
      setRefLoading(false)
    }
  }, [regionName])

  useEffect(() => {
    setRegion(regionCode)
    loadReference(regionCode)
  }, [regionCode, loadReference])

  useEffect(() => {
    if (!regionCode) loadReference(region)
  }, [region, regionCode, loadReference])

  const breakdown = calculateSubscriptionScore(input)
  const isLastStep = step === STEPS.length - 1
  const showResult = result !== null

  const handleNext = () => {
    if (isLastStep) {
      setCalculating(true)
      requestAnimationFrame(() => {
        const pred = buildPrediction(input, reference, complexName)
        setResult(pred)
        setCalculating(false)
      })
    } else {
      setStep(s => s + 1)
    }
  }

  const handleBack = () => {
    if (showResult) {
      setResult(null)
      setStep(STEPS.length - 1)
    } else if (step > 0) setStep(s => s - 1)
  }

  const reset = () => {
    setResult(null)
    setStep(0)
    setInput({ homelessYears: 5, dependents: 2, accountYears: 7 })
  }

  return (
    <div className={`predict-calc${compact ? ' predict-calc--compact' : ''}`}>
      {!compact && (
        <div className="predict-hero rise">
          <span className="predict-badge">AI Prediction</span>
          <h2 className="predict-title">당첨 확률 계산기</h2>
          <p className="predict-desc">
            청약홈 당첨자 가점 통계를 바탕으로, 입력하신 조건의 예상 당첨 가능성을 분석합니다.
            {complexName && (
              <>
                <br />
                <strong style={{ color: 'var(--ink)', fontWeight: 650 }}>분석 대상: {complexName}</strong>
              </>
            )}
          </p>
        </div>
      )}

      {!showResult ? (
        <>
          <div className="predict-stepper" role="tablist" aria-label="입력 단계">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === step}
                className="predict-step-dot"
                data-done={i < step ? 'true' : 'false'}
                data-active={i === step ? 'true' : 'false'}
                onClick={() => i <= step && setStep(i)}
              >
                <span className="predict-step-num">{i + 1}</span>
                <span className="predict-step-label">{s.title}</span>
              </button>
            ))}
          </div>

          <Card className="predict-card rise">
            <h3 className="predict-step-title">{STEPS[step].title}</h3>
            <p className="predict-step-desc">{STEPS[step].desc}</p>

            {step === 0 && (
              <div className="predict-control">
                <div className="predict-value-row">
                  <span className="predict-value tnum">{input.homelessYears}</span>
                  <span className="predict-unit">년</span>
                  <span className="predict-points tnum">+{breakdown.homeless}점</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={16}
                  step={1}
                  value={input.homelessYears}
                  onChange={e => setInput(p => ({ ...p, homelessYears: Number(e.target.value) }))}
                  className="predict-range"
                />
                <div className="predict-range-labels">
                  <span>0년</span>
                  <span>16년+</span>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="predict-control">
                <div className="predict-stepper-btns">
                  <button
                    type="button"
                    className="predict-step-btn"
                    aria-label="감소"
                    disabled={input.dependents <= 0}
                    onClick={() => setInput(p => ({ ...p, dependents: Math.max(0, p.dependents - 1) }))}
                  >
                    −
                  </button>
                  <div className="predict-stepper-value">
                    <span className="tnum" style={{ fontSize: 42, fontWeight: 760, letterSpacing: '-0.04em' }}>
                      {input.dependents}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--ink-3)', fontWeight: 500 }}>명</span>
                    <span className="predict-points tnum" style={{ marginTop: 8 }}>+{breakdown.dependents}점</span>
                  </div>
                  <button
                    type="button"
                    className="predict-step-btn"
                    aria-label="증가"
                    disabled={input.dependents >= 6}
                    onClick={() => setInput(p => ({ ...p, dependents: Math.min(6, p.dependents + 1) }))}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="predict-control">
                <div className="predict-value-row">
                  <span className="predict-value tnum">{input.accountYears}</span>
                  <span className="predict-unit">년</span>
                  <span className="predict-points tnum">+{breakdown.account}점</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={17}
                  step={1}
                  value={input.accountYears}
                  onChange={e => setInput(p => ({ ...p, accountYears: Number(e.target.value) }))}
                  className="predict-range"
                />
                <div className="predict-range-labels">
                  <span>0년</span>
                  <span>17년+</span>
                </div>
              </div>
            )}

            <div className="predict-score-preview">
              <span>예상 총 가점</span>
              <strong className="tnum">{breakdown.total}</strong>
              <span>/ 84점</span>
            </div>

            {!regionCode && step === 0 && (
              <div style={{ marginTop: 20 }}>
                <label className="info-cell-label">비교 지역 (당첨 통계)</label>
                <select
                  className="predict-select field-focus"
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  disabled={refLoading}
                >
                  {REGIONS.map(r => (
                    <option key={r.code} value={r.code}>{r.name}</option>
                  ))}
                </select>
              </div>
            )}
          </Card>

          <div className="predict-actions">
            {(step > 0 || onClose) && (
              <button type="button" className="btn-ghost" onClick={step > 0 ? handleBack : onClose}>
                {step > 0 ? '이전' : '닫기'}
              </button>
            )}
            <button
              type="button"
              className="btn-ink predict-next-btn"
              onClick={handleNext}
              disabled={calculating || refLoading}
            >
              {calculating ? '분석 중…' : isLastStep ? '당첨 확률 분석' : '다음'}
            </button>
          </div>
        </>
      ) : (
        <div className="predict-result rise">
          <RadialGauge
            value={result.probability}
            label="당첨 확률"
            sublabel={result.headline}
          />

          <div className="predict-insight">
            <p className="predict-insight-main">{result.insight}</p>
            <p className="predict-insight-sub">{result.detail}</p>
          </div>

          <div className="predict-compare-grid">
            <CompareCell label="내 가점" value={result.breakdown.total} highlight />
            <CompareCell label="평균 당첨" value={result.reference.avg} />
            <CompareCell label="커트라인" value={result.reference.min} />
            <CompareCell label="최고 가점" value={result.reference.max} />
          </div>

          <div className="predict-breakdown">
            <div className="predict-breakdown-row">
              <span>무주택</span>
              <span className="tnum">{result.breakdown.homeless}점</span>
            </div>
            <div className="predict-breakdown-row">
              <span>부양가족</span>
              <span className="tnum">{result.breakdown.dependents}점</span>
            </div>
            <div className="predict-breakdown-row">
              <span>청약통장</span>
              <span className="tnum">{result.breakdown.account}점</span>
            </div>
          </div>

          <p className="predict-disclaimer">
            * 청약홈 공개 당첨자 가점 통계 기반 추정치이며, 실제 당첨 결과와 다를 수 있습니다.
            {result.reference.sampleCount > 0 && ` (${result.reference.regionName} · 표본 ${result.reference.sampleCount}건)`}
          </p>

          <div className="predict-actions">
            <button type="button" className="btn-ghost" onClick={reset}>
              다시 계산
            </button>
            {onClose && (
              <button type="button" className="btn-ink" onClick={onClose}>
                완료
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function CompareCell({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`predict-compare-cell${highlight ? ' predict-compare-cell--hi' : ''}`}>
      <div className="predict-compare-label">{label}</div>
      <div className="predict-compare-value tnum">{typeof value === 'number' ? value.toFixed(1) : value}</div>
    </div>
  )
}
