'use client'

import Link from 'next/link'
import { Icon } from '@/components/ui'

export default function SiteHeader({
  dark,
  onToggleTheme,
  updated,
  backHref,
}: {
  dark: boolean
  onToggleTheme: () => void
  updated?: string
  backHref?: string
}) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'color-mix(in oklch, var(--bg), transparent 28%)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      <div
        className="dash-header-inner"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '0 32px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {backHref && (
            <Link href={backHref} className="back-link" aria-label="목록으로">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
          )}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', color: 'inherit' }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                background: 'var(--ink)',
                color: 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="home" size={17} />
            </div>
            <span style={{ fontSize: 17, fontWeight: 750, letterSpacing: '-0.03em', color: 'var(--ink)', whiteSpace: 'nowrap' }}>
              청약 인사이트
            </span>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          {updated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--ink-3)', fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--ink)', display: 'inline-block' }} />
              최종 업데이트 {updated}
            </div>
          )}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="테마 전환"
            className="theme-btn"
          >
            {dark ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5Z" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
