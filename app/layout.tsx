import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '청약 인사이트 — 청약 현황 대시보드',
  description: '청약홈 공공데이터 기반 분양정보·경쟁률·당첨자 통계 대시보드',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="light" data-density="regular" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
