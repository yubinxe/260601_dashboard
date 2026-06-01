'use client'

import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

export function InkTag({ children }: { children: ReactNode }) {
  return <span className="tag-ink">{children}</span>
}

export function InkLink({
  href,
  children,
  external,
  onClick,
}: {
  href: string
  children: ReactNode
  external?: boolean
  onClick?: (e: React.MouseEvent) => void
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="link-ink"
        onClick={onClick}
      >
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className="link-ink" onClick={onClick}>
      {children}
    </Link>
  )
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const start = Math.max(1, Math.min(page - 2, totalPages - 4))

  return (
    <nav className="pag-nav" aria-label="페이지">
      <PagBtn onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1} aria-label="이전">
        ‹
      </PagBtn>
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        const p = start + i
        return (
          <PagBtn key={p} active={p === page} onClick={() => onChange(p)} aria-label={`${p}페이지`}>
            {p}
          </PagBtn>
        )
      })}
      <PagBtn onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages} aria-label="다음">
        ›
      </PagBtn>
    </nav>
  )
}

function PagBtn({
  children,
  onClick,
  disabled,
  active,
  'aria-label': ariaLabel,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  'aria-label'?: string
}) {
  return (
    <button
      type="button"
      className="pag-btn"
      data-active={active ? 'true' : 'false'}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
    >
      {children}
    </button>
  )
}

export function PrimaryButton({
  children,
  onClick,
  href,
  style,
}: {
  children: ReactNode
  onClick?: () => void
  href?: string
  style?: CSSProperties
}) {
  const cls = 'btn-ink'
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={cls} onClick={onClick} style={style}>
      {children}
    </button>
  )
}
