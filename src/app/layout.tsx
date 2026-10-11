import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "왜멈추니 - 실시간 지연 감지",
  description: "경의중앙선 지하철 터널 내 정차 감지 및 지연증명서 자동 발급 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen flex flex-col items-center justify-start bg-slate-100">
        {children}
      </body>
    </html>
  );
}
