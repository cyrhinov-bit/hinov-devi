import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifie si l'app est déjà installée (ouverte en mode standalone)
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const checkPrompt = () => {
      if ((window as any).deferredPWAInstallPrompt) {
        setDeferredPrompt((window as any).deferredPWAInstallPrompt);
      }
    };

    checkPrompt();
    window.addEventListener('pwa-install-ready', checkPrompt);

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
