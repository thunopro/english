import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VocabVault — Reading 01: Pearls | IELTS Academic Vocabulary',
  description:
    'Sổ tay từ vựng tiếng Anh cá nhân với bài đọc IELTS Reading 01: Pearls, câu hỏi trắc nghiệm tương tác, phát âm chuẩn người bản xứ và thẻ flashcards SRS.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
