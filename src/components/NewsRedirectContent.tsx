"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function NewsRedirectContent() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const newsId = searchParams.get('id');
    
    if (newsId) {
      // Tenter d'ouvrir l'app mobile avec le deep link
      window.location.href = `wheeloh://news?id=${newsId}`;
      
      // Si échec après 1 seconde => Rediriger vers les stores
      const redirectTimer = setTimeout(() => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        
        if (/iPhone|iPad|iPod/i.test(userAgent)) {
          // Redirection vers App Store (remplacer par l'ID réel quand disponible)
          window.location.href = "https://apps.apple.com/app/wheeloh/idXXXXXXXXX";
        } else if (/android/i.test(userAgent)) {
          // Redirection vers Play Store
          window.location.href = "https://play.google.com/store/apps/details?id=com.wheeloh.app";
        } else {
          // Fallback vers la page d'accueil
          window.location.href = "/";
        }
      }, 1000);
      
      return () => clearTimeout(redirectTimer);
    } else {
      // Si pas d'ID dans l'URL, rediriger vers la page d'accueil
      window.location.href = "/";
    }
  }, [searchParams]);
  
  return (
    <div className="flex items-center justify-center h-screen flex-col">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Redirection vers l'application Wheeloh...</h1>
        <p className="text-muted-foreground">Veuillez patienter, vous allez être redirigé automatiquement.</p>
      </div>
    </div>
  );
} 