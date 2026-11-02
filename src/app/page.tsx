'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../App').then((mod) => mod.App), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Đang tải VocabVault (Reading 01: Pearls)...
        </span>
      </div>
    </div>
  ),
});

export default function Home() {
  return <App />;
}
