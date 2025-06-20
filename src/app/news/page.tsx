"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Suspense } from 'react';
// Correction de l'import : le chemin du composant doit être correct.
// Correction de l'import : le chemin du composant doit être correct.
// Si le composant NewsRedirectContent n'existe pas à cet emplacement, veuillez ajuster le chemin ci-dessous.
import NewsRedirectContent from '@/components/NewsRedirectContent';

export default function NewsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header showNavLinks={false} />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center w-full h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black-500 mb-6"></div>
            <h1 className="text-2xl font-bold mb-2">Redirection en cours...</h1>
            <p className="text-muted-foreground">Veuillez patienter, vous allez être redirigé automatiquement.</p>
          </div>
        }>
          <NewsRedirectContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
} 