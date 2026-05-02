export const metadata = {
  title: "LOTTO V2 | 5년 통계 기반 번호 추천",
  description: "최근 5년 실제 로또 6/45 1등 번호 데이터를 분석해 추천 조합을 생성합니다.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
