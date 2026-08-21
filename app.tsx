import React from 'react';
import { createRoot } from 'react-dom/client';
import ParallaxHero from './components/ui/demo.tsx';
import EditorialPage, { EditorialKind } from './components/ui/editorial.tsx';

function App() {
  const page = window.location.pathname.split('/').pop() ?? '';
  const editorialKind: EditorialKind | null = page === 'journal.html'
    ? 'journal'
    : page === 'atlas.html'
      ? 'atlas'
      : page === 'archive.html'
        ? 'archive'
        : null;

  if (editorialKind) return <EditorialPage kind={editorialKind} />;
  return <ParallaxHero title="DUNES" />;
}

createRoot(document.getElementById('root')!).render(<App />);
