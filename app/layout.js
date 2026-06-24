import Script from 'next/script';
import { ThemeProvider } from '../lib/useTheme';
import './globals.css';

export const metadata = {
  title: 'Access Request System',
  description: 'Hệ thống quản lý yêu cầu truy cập nội bộ',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
        <Script id="theme-init" strategy="beforeInteractive">{`
          try {
            var t = localStorage.getItem('theme');
            if (t) document.documentElement.setAttribute('data-theme', t);
          } catch(e) {}
        `}</Script>
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
