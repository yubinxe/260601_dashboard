'use client'

import { useCallback, useEffect, useRef } from 'react'

const AUTO_ADVANCE_MS = 720

/** 빠른 입력 후 잠시 멈추면 다음 단계로 자동 이동 */
export function usePredictAutoAdvance(onAdvance: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const schedule = useCallback(() => {
    cancel()
    timer.current = setTimeout(() => {
      timer.current = null
      onAdvance()
    }, AUTO_ADVANCE_MS)
  }, [cancel, onAdvance])

  useEffect(() => cancel, [cancel])

  return { schedule, cancel }
}
