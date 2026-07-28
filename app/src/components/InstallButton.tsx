import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    const isStandalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    const isIosStandalone = (window.navigator as any).standalone === true;

    // Vérifie si l'app est déjà installée
    if (isStandalone || isIosStandalone) {
      setIsInstalled(true);
    }

    const checkPrompt = () => {
      if ((window as any).deferredPWAInstallPrompt) {
        setDeferredPrompt((window as any).deferredPWAInstallPrompt);
      }
    };

    checkPrompt();
    window.addEventListener('pwa-install-ready', checkPrompt);

    // Activer manuellement le bouton pour iOS (car Apple ne supporte pas l'installation automatique)
    if (isIos() && !isStandalone && !isIosStandalone) {
      setDeferredPrompt('ios');
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      (window as any).deferredPWAInstallPrompt = null;
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-install-ready', checkPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt === 'ios') {
      alert("🍏 Pour installer sur iPhone/iPad :\n\n1. Appuyez sur l'icône 'Partager' (le carré avec la flèche vers le haut) en bas de l'écran de Safari.\n2. Faites défiler le menu et sélectionnez 'Sur l'écran d'accueil'.\n3. Confirmez en haut à droite.");
      return;
    }

    if (!deferredPrompt) {
      // Fallback manuel si le navigateur bloque le prompt automatique
      alert("L'installation automatique est bloquée par votre navigateur.\n\nPOUR INSTALLER MANUELLEMENT :\n1. Regardez tout à droite de votre barre d'adresse en haut.\n2. Cliquez sur la petite icône d'installation (un écran avec une flèche ou un '+' ).\n3. Ou bien, ouvrez le menu de votre navigateur (•••) puis choisissez 'Installer l'application'.");
      return;
    }
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
  };

  // Ne pas afficher le bouton si l'app est déjà installée
  if (isInstalled) return null;

  return (
    <button 
      onClick={handleInstallClick}
      type="button"
      className="btn btn-outline"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', marginTop: '16px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
    >
      <Download size={18} />
      Installer l'Application (PWA)
    </button>
  );
}
