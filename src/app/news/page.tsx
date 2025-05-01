"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function NewsPageWrapper() {
  return (
    <Suspense fallback={<NewsPageFallback />}> 
      <NewsPage />
    </Suspense>
  );
}

function NewsPageFallback() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 mt-12 mb-12 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Image src="/logo.svg" alt="Wheeloh" width={32} height={32} />
          Article Wheeloh
        </h1>
        <div className="text-gray-400 text-lg min-h-[120px] flex items-center justify-center animate-pulse">
          Chargement de l'article...
        </div>
      </div>
    </main>
  );
}

function NewsPage() {
  const searchParams = useSearchParams();
  const newsId = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [webContent, setWebContent] = useState<string | null>(null);
  const [showOpenApp, setShowOpenApp] = useState(false);

  useEffect(() => {
    function isMobile() {
      return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }
    // On ne tente jamais d'ouvrir l'app automatiquement si on est déjà sur wheeloh.com
    if (newsId) {
      if (typeof window !== "undefined" && isMobile()) {
        // Affiche le bouton "Ouvrir dans l'app" uniquement sur mobile
        setShowOpenApp(true);
      }
      setWebContent(`Affichage web de l'article ${newsId}`);
      setLoading(false);
    } else {
      setWebContent("Aucun article sélectionné.");
      setLoading(false);
    }
  }, [newsId]);

  function handleOpenApp() {
    if (!newsId) return;
    // Tente d'ouvrir l'app via schéma personnalisé (nécessite config native)
    const appUrl = `wheeloh://news?id=${newsId}`;
    const playStore = "https://play.google.com/store/apps/details?id=ton.package";
    const appStore = "https://apps.apple.com/app/idTON_APP_ID";
    window.location.href = appUrl;
    setTimeout(() => {
      if (/Android/i.test(navigator.userAgent)) {
        window.location.href = playStore;
      } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = appStore;
      }
    }, 1500);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 mt-12 mb-12 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Image src="/logo.svg" alt="Wheeloh" width={32} height={32} />
          Article Wheeloh
        </h1>
        <div className="text-gray-700 text-lg min-h-[120px] flex items-center justify-center">
          {loading ? (
            <span className="animate-pulse text-gray-400">Chargement de l'article...</span>
          ) : (
            webContent
          )}
        </div>
        {showOpenApp && newsId && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleOpenApp}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-colors duration-200"
            >
              Ouvrir dans l'application
            </button>
          </div>
        )}
      </div>
    </main>
  );
} 