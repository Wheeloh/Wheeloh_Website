"use client";

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Suspense } from 'react';
import UsersRedirectContent from '@/components/UsersRedirectContent';

export default function UsersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header showNavLinks={false} />
      <main className="flex-1 flex items-center justify-center">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center w-full h-[60vh]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-6"></div>
            <h1 className="text-2xl font-bold mb-2">Redirection en cours...</h1>
            <p className="text-muted-foreground">Veuillez patienter, vous allez être redirigé automatiquement.</p>
          </div>
        }>
          <UsersRedirectContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
} 