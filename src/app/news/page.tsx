"use client";

import { Suspense } from 'react';
// Correction de l'import : le chemin du composant doit être correct.
// Supposons que le composant se trouve dans 'src/components/NewsRedirectContent.tsx'.
// Si ce n'est pas le cas, veuillez ajuster le chemin en conséquence.
import NewsRedirectContent from '../../components/NewsRedirectContent';

export default function NewsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen flex-col">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold">Chargement...</h1>
          <p className="text-muted-foreground">Veuillez patienter un instant.</p>
        </div>
      </div>
    }>
      <NewsRedirectContent />
    </Suspense>
  );
} 