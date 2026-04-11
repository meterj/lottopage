import { Suspense } from 'react';

export const metadata = {
  title: 'Lucky Lotto - AI Prediction',
  description: 'Premium AI Lotto Prediction System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Suspense fallback={<div>Loading router...</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
