'use client'

import { useId, useRef } from 'react'
import { format, parseISO, isValid } from 'date-fns'
import { Icon } from '@/components/ui'

function formatDateLabel(ymd: string) {
  if (!ymd) return '날짜 선택'
  const d = parseISO(ymd)
  if (!isValid(d)) return ymd
  return format(d, 'yyyy. M. d.')
}

export function FilterField({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`filter-field ${className}`.trim()}>
      <span className="filter-field__label">{label}</span>
      {children}
    </div>
  )
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  const id = useId()
  return (
    <FilterField label={label}>
      <div className="filter-control filter-control--select">
        <select
          id={id}
          className="filter-control__native"
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          {options.map(o => (
            <option key={o.value || 'all'} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className="filter-control__chevron" aria-hidden>
          <Icon name="chevron" size={14} />
        </span>
      </div>
    </FilterField>
  )
}

export function SegmentControl<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <FilterField label={label}>
      <div className="segment-control" role="group" aria-label={label}>
        {options.map(o => {
          const on = value === o.value
          return (
            <button
              key={o.value || 'all'}
              type="button"
              className={`segment-control__btn${on ? ' segment-control__btn--on' : ''}`}
              aria-pressed={on}
              onClick={() => onChange(o.value)}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </FilterField>
  )
}

export function DateField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
}) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <FilterField label={label}>
      <div className="filter-control filter-control--date">
        <button
          type="button"
          className="filter-control__date-btn"
          onClick={() => {
            try {
              inputRef.current?.showPicker?.()
            } catch {
              inputRef.current?.focus()
            }
          }}
          aria-labelledby={id}
        >
          <span className="filter-control__date-icon" aria-hidden>
            <Icon name="calendar" size={16} />
          </span>
          <span className={`filter-control__date-text${value ? '' : ' filter-control__date-text--placeholder'}`}>
            {formatDateLabel(value)}
          </span>
        </button>
        <input
          ref={inputRef}
          id={id}
          type="date"
          className="filter-control__date-native"
          value={value}
          min={min}
          max={max}
          onChange={e => onChange(e.target.value)}
          tabIndex={-1}
          aria-hidden
        />
      </div>
    </FilterField>
  )
}

export function FilterSearch({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const id = useId()
  return (
    <FilterField label={label} className="filter-field--grow">
      <div className="filter-control filter-control--search">
        <span className="filter-control__search-icon" aria-hidden>
          <Icon name="search" size={15} />
        </span>
        <input
          id={id}
          type="search"
          className="filter-control__input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>
    </FilterField>
  )
}
