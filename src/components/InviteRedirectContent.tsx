"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function InviteRedirectContent() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const inviteCode = searchParams.get('code');
    
    if (inviteCode) {
      // Tenter d'ouvrir l'app mobile avec le deep link
      window.location.href = `wheeloh://invite?code=${inviteCode}`;
      
      // Si échec après 1 seconde => Rediriger vers les stores
      const redirectTimer = setTimeout(() => {
        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
        
        if (/iPhone|iPad|iPod/i.test(userAgent)) {
          // Redirection vers App Store (remplacer par l'ID réel quand disponible)
          //window.location.href = "https://apps.apple.com/app/wheeloh/idXXXXXXXXX";
          window.location.href = "https://wheeloh.com/";
        } else if (/android/i.test(userAgent)) {
          // Redirection vers Play Store
          window.location.href = "https://play.google.com/store/apps/details?id=com.wheeloh.app";
        } else {
          // Fallback vers la page d'accueil
          window.location.href = "/";
        }
      }, 4000);
      
      return () => clearTimeout(redirectTimer);
    } else {
      // Si pas de code dans l'URL, rediriger vers la page d'accueil
      window.location.href = "/";
    }
  }, [searchParams]);
  
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh] sm:min-h-[60vh] px-4 py-8 sm:py-0 bg-white">
      <div className="relative mb-8 w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-neutral-200 blur-xl opacity-60 animate-pulse"></div>
        </div>
        <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 border-t-4 border-b-4 border-black border-opacity-80"></div>
        <img src="/applogo.svg" alt="Wheeloh logo" className="absolute top-1/2 left-1/2 w-10 h-10 sm:w-16 sm:h-16 -translate-x-1/2 -translate-y-1/2 drop-shadow-xl" />
      </div>
      <h1 className="text-xl sm:text-2xl font-bold mb-2 text-black text-center">Redirection vers l'application Wheeloh...</h1>
      <p className="text-neutral-600 mb-2 text-center text-sm sm:text-base">Acceptation de votre invitation en cours...</p>
      <span className="text-xs sm:text-sm text-neutral-400 animate-pulse text-center">Si rien ne se passe, vérifiez que l'application est bien installée.</span>
    </div>
  );
} 