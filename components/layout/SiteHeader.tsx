'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  const pathname = usePathname()
  const router = useRouter()

  const goHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    router.push('/')
  }

  return (
    <header className="site-header">
      <div className="site-header__inner dash-header-inner">
        <div className="site-header__left">
          {backHref && (
            <Link href={backHref} className="back-link" aria-label="목록으로">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
          )}
          <Link href="/" className="site-brand" onClick={goHome} aria-label="청약 인사이트 홈">
            <span className="site-brand__mark">
              <Icon name="home" size={17} />
            </span>
            <span className="site-brand__name">청약 인사이트</span>
          </Link>
        </div>
        <div className="site-header__right">
          {updated && (
            <div className="site-header__updated">
              <span className="site-header__updated-dot" />
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
