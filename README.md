# 청약 인사이트 대시보드

청약홈 OpenAPI 기반 분양정보·경쟁률·당첨자 통계·AI 당첨 예측·핫플레이스 지도 대시보드입니다.

## 로컬 실행

```bash
npm install
cp .env.example .env.local
# .env.local 에 공공데이터포털 API 키 입력
npm run dev
```

## Vercel 배포

1. [Vercel](https://vercel.com)에서 GitHub 저장소 `yubinxe/260601_dashboard` 연결
2. **Root Directory**: 저장소 루트 (`cheongak-dashboard`가 루트인 경우 그대로)
3. **Environment Variables** (Production · Preview · Development 모두):

| 이름 | 설명 |
|------|------|
| `PUBLIC_DATA_API_KEY` | [공공데이터포털](https://www.data.go.kr) 청약홈 API 인증키 |

4. Deploy — Framework Preset: **Next.js** (자동 감지)

빌드 명령: `npm run build` · 출력: Next.js 기본

## 주요 기능

- 분양정보 조회 · 단지 상세 페이지
- 지역별 경쟁률 통계
- 당첨자·가점 통계
- AI 당첨 확률 계산기
- 청약 핫플레이스 지도 (히트맵 + Bottom Sheet)

## 데이터 출처

공공데이터포털 청약홈 OpenAPI · 한국부동산원
