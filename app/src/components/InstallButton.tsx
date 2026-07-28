import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const checkPrompt = () => {
      if ((window as any).deferredPWAInstallPrompt) {
        setDeferredPrompt((window as any).deferredPWAInstallPrompt);
        setIsInstallable(true);
      }
    };

    // Vérifier si l'événement a déjà eu lieu avant le chargement de React
    checkPrompt();

    // Sinon écouter l'événement custom que nous envoyons depuis index.html
    window.addEventListener('pwa-install-ready', checkPrompt);

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      (window as any).deferredPWAInstallPrompt = null;
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('pwa-install-ready', checkPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
  };

  if (!isInstallable) return null;

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
