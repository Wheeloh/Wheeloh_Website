"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function UsersRedirectContent() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const userId = searchParams.get('id');
    
    if (userId) {
      // Tenter d'ouvrir l'app mobile avec le deep link
      window.location.href = `wheeloh://user?id=${userId}`;
      
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
      }, 1000);
      
      return () => clearTimeout(redirectTimer);
    } else {
      // Si pas d'ID dans l'URL, rediriger vers la page d'accueil
      window.location.href = "/";
    }
  }, [searchParams]);
  
  return (
    <div className="flex flex-col items-center justify-center w-full h-[60vh] bg-white">
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-neutral-200 blur-xl opacity-60 animate-pulse"></div>
        </div>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-black border-opacity-80"></div>
        <img src="/applogo.svg" alt="Wheeloh logo" className="absolute top-1/2 left-1/2 w-10 h-10 -translate-x-1/2 -translate-y-1/2 drop-shadow-xl" />
      </div>
      <h1 className="text-2xl font-bold mb-2 text-black">Redirection vers l'application Wheeloh...</h1>
      <p className="text-neutral-600 mb-2">Veuillez patienter, vous allez être redirigé automatiquement.</p>
      <span className="text-xs text-neutral-400 animate-pulse">Si rien ne se passe, vérifiez que l'application est bien installée.</span>
    </div>
  );
} 