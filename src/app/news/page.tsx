"use client";
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

export default function NewsPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  useEffect(() => {
    if (!id) return;
    
    // Fonction pour rediriger vers l'app ou le store
    const redirectToAppOrStore = () => {
      // URL du deep link
      const deepLink = `wheeloh://news?id=${id}`;
      
      // Tentative d'ouverture de l'app
      window.location.href = deepLink;
      
      // Redirection vers Play Store après délai si l'app n'est pas installée
      setTimeout(() => {
        window.location.href = 'https://play.google.com/store/apps/details?id=com.wheeloh.app';
        // Si vous souhaitez rediriger également vers l'App Store pour iOS:
        // if (/* logique pour détecter iOS */) {
        //   window.location.href = 'https://apps.apple.com/app/wheeloh/id123456789';
        // } else {
        //   window.location.href = 'https://play.google.com/store/apps/details?id=com.wheeloh.app';
        // }
      }, 1500);
    };
    
    // Déclencher la redirection au chargement de la page
    redirectToAppOrStore();
    toast.info("Redirection vers l'application en cours...");
  }, [id]);
  
  // Page affichée pendant la tentative de redirection
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Toaster />
      <Header showNavLinks={true} />
      <main className="flex-1">
        <div className="container flex flex-col items-center justify-center h-[70vh] px-4 md:px-6">
          {!id ? (
            <>
              <h1 className="text-3xl font-bold text-center">Aucun article spécifié</h1>
              <p className="mt-4 text-muted-foreground text-center">
                Veuillez spécifier un ID d'article valide
              </p>
              <Link href="/" className="mt-8">
                <Button>Retourner à l'accueil</Button>
              </Link>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              <h1 className="text-3xl font-bold mt-8 text-center">
                Ouverture de Wheeloh en cours...
              </h1>
              <p className="mt-4 text-muted-foreground text-center max-w-md">
                Si l'application ne s'ouvre pas automatiquement, vous allez être redirigé vers le Play Store
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 